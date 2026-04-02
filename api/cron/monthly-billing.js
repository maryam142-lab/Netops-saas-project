const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('../../server/config/db');
const { generateMonthlyBills } = require('../../server/services/billingService');
const BillingRun = require('../../server/models/BillingRun');
const Tenant = require('../../server/models/Tenant');
const { logger } = require('../../server/utils/logger');
const { sendAlert } = require('../../server/utils/alerting');
const { requireTenantId } = require('../../server/utils/tenant');

// Load server env for local development (Vercel uses project env vars)
dotenv.config({ path: path.join(__dirname, '..', '..', 'server', '.env') });

const assertAuthorized = (req) => {
  const userAgent = req.headers?.['user-agent'] || '';
  if (userAgent.includes('vercel-cron/1.0')) {
    return true;
  }

  const authHeader = req.headers?.authorization || '';
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
};

module.exports = async (req, res) => {
  const requestId = require('crypto').randomUUID();
  req.context = { requestId, startTime: Date.now() };
  res.locals = res.locals || {};
  res.locals.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - req.context.startTime;
    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.url,
      status: res.statusCode,
      durationMs,
      userId: req.user?._id || null,
      tenantId: req.tenantId || null,
    });
  });

  if (!assertAuthorized(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    await connectDB();

    const tenants = await Tenant.find({ status: 'active' }).select('_id').lean();
    if (!tenants.length) {
      return res.status(200).json({ success: true, message: 'No active tenants found' });
    }

    const now = new Date();
    const runDate = now;
    const monthKey = `${runDate.getFullYear()}-${String(runDate.getMonth() + 1).padStart(2, '0')}`;
    const lockMinutes = Number(process.env.BILLING_LOCK_MINUTES || 15);
    const lockExpiresAt = new Date(now.getTime() + lockMinutes * 60 * 1000);

    const results = [];

    for (const tenant of tenants) {
      const tenantId = String(tenant._id);
      req.context.tenantId = tenantId;
      req.tenantId = tenantId;

      const locked = await BillingRun.findOneAndUpdate(
        {
          tenantId: requireTenantId(tenantId),
          month: monthKey,
          $and: [
            { status: { $ne: 'success' } },
            {
              $or: [
                { lockExpiresAt: { $exists: false } },
                { lockExpiresAt: { $lt: now } },
              ],
            },
          ],
        },
        {
          $set: {
            status: 'running',
            lockExpiresAt,
            startedAt: now,
            errorMessage: '',
          },
          $inc: { attempts: 1 },
        },
        { new: true, upsert: true }
      );

      if (!locked) {
        logger.info('Billing run skipped (locked or already complete)', {
          requestId,
          tenantId,
          month: monthKey,
        });
        results.push({ tenantId, month: monthKey, skipped: true, created: 0 });
        continue;
      }

      try {
        const result = await generateMonthlyBills(runDate, req.context);

        await BillingRun.updateOne(
          { _id: locked._id },
          {
            $set: {
              status: 'success',
              completedAt: new Date(),
              createdCount: result.created || 0,
              lockExpiresAt: null,
            },
          }
        );

        logger.info('Billing run completed', {
          requestId,
          tenantId,
          month: monthKey,
          createdCount: result.created || 0,
        });

        results.push({ tenantId, month: monthKey, created: result.created || 0 });
      } catch (tenantErr) {
        await BillingRun.updateOne(
          { _id: locked._id },
          {
            $set: {
              status: 'failed',
              completedAt: new Date(),
              errorMessage: tenantErr?.message || 'Billing job failed',
              lockExpiresAt: null,
            },
          }
        );

        logger.error('Billing run failed', {
          requestId,
          tenantId,
          month: monthKey,
          error: tenantErr?.message,
        });

        results.push({
          tenantId,
          month: monthKey,
          error: tenantErr?.message || 'Billing job failed',
        });
      }
    }

    return res.status(200).json({ success: true, month: monthKey, results });
  } catch (err) {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    await sendAlert({
      level: 'critical',
      title: 'Billing cron failed',
      message: err?.message || 'Billing job failed',
      context: { month: monthKey, requestId },
      dedupeKey: `billing-failed:all:${monthKey}`,
      dedupeSeconds: 900,
    });
    return res.status(500).json({
      success: false,
      message: err.message || 'Billing job failed',
    });
  }
};
