const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const packageRoutes = require('./routes/packages');
const connectionRoutes = require('./routes/connections');
const billingRoutes = require('./routes/billing');
const paymentRoutes = require('./routes/payment');
const reportRoutes = require('./routes/reports');
const customerRoutes = require('./routes/customer');
const supportRoutes = require('./routes/support');
const crypto = require('crypto');
const { rateLimitMiddleware } = require('./middleware/rateLimit');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use((req, res, next) => {
  req.context = req.context || {
    requestId: crypto.randomUUID(),
    startTime: Date.now(),
  };
  res.locals = res.locals || {};
  res.locals.requestId = req.context.requestId;
  next();
});
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use((req, res, next) => {
  const headerTenant = req.headers['x-tenant-id'];
  const bodyTenant =
    req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)
      ? req.body.tenantId
      : undefined;
  const queryTenant = req.query?.tenantId;
  const tenantId = headerTenant || bodyTenant || queryTenant || '';
  if (tenantId) {
    req.tenantId = req.tenantId || tenantId;
    req.context = req.context || {};
    req.context.tenantId = req.context.tenantId || tenantId;
  }
  return next();
});

app.use(rateLimitMiddleware('general'));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/payment', rateLimitMiddleware('payments'), paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/support', supportRoutes);

module.exports = app;
