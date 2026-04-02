const User = require('../models/User');
const { signToken } = require('../utils/token');
const { AppError } = require('../utils/appError');
const { withTenant, ensureTenantInPayload } = require('../utils/tenant');
const { logger } = require('../utils/logger');

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const resolveTenantForLogin = async (email, context) => {
  if (context?.tenantId) {
    return { tenantId: context.tenantId, source: 'context' };
  }

  if (!email) {
    return { tenantId: '', source: 'missing_email' };
  }

  const matches = await User.find({ email }).select('tenantId').limit(2);
  if (matches.length === 1) {
    return { tenantId: matches[0].tenantId, source: 'email_lookup' };
  }

  if (matches.length > 1) {
    return { tenantId: '', source: 'ambiguous_email' };
  }

  return { tenantId: '', source: 'email_not_found' };
};

const registerUser = async ({ name, email, password, role, phone, address }, context) => {
  const normalizedEmail = normalizeEmail(email);
  const tenantId = context?.tenantId || 'default_tenant';
  if (!context?.tenantId) {
    logger.warn('Auth register tenant fallback', {
      requestId: context?.requestId || null,
      email: normalizedEmail,
      tenantId,
    });
  }
  logger.info('Auth register attempt', {
    requestId: context?.requestId || null,
    email: normalizedEmail,
    tenantId,
  });

  const forceInsert = process.env.AUTH_FORCE_INSERT === 'true';
  let existing = null;
  if (!forceInsert) {
    existing = await User.findOne(withTenant(tenantId, { email: normalizedEmail })).select(
      '_id email tenantId'
    );
    logger.info('Auth register lookup', {
      requestId: context?.requestId || null,
      email: normalizedEmail,
      tenantId,
      exists: Boolean(existing),
      userId: existing?._id || null,
    });
  } else {
    logger.warn('Auth register force insert enabled (skipping duplicate check)', {
      requestId: context?.requestId || null,
      email: normalizedEmail,
      tenantId,
    });
  }

  const legacyUser = await User.findOne({
    email: normalizedEmail,
    $or: [{ tenantId: { $exists: false } }, { tenantId: null }, { tenantId: '' }],
  }).select('_id email tenantId');
  if (legacyUser) {
    logger.info('Auth register legacy user found (ignored)', {
      requestId: context?.requestId || null,
      email: normalizedEmail,
      legacyUserId: legacyUser?._id || null,
    });
  }
  if (existing) {
    logger.info('Auth register conflict', {
      requestId: context?.requestId || null,
      reason: 'user_exists',
      email: normalizedEmail,
      tenantId,
      userId: existing?._id || null,
    });
    throw new AppError('User already exists in this tenant', 409);
  }

  let user;
  try {
    user = await User.create(
      ensureTenantInPayload(tenantId, {
        name,
        email: normalizedEmail,
        password,
        role: role || 'customer',
        phone,
        address,
      })
    );
  } catch (err) {
    logger.error('Auth register mongo error', {
      requestId: context?.requestId || null,
      email: normalizedEmail,
      tenantId,
      error: err,
    });
    if (err && err.name === 'MongoServerError' && err.code === 11000) {
      logger.error('Auth register duplicate key error', {
        requestId: context?.requestId || null,
        email: normalizedEmail,
        tenantId,
        error: {
          name: err.name,
          code: err.code,
          keyPattern: err.keyPattern,
          keyValue: err.keyValue,
          message: err.message,
        },
      });
      logger.info('Auth register conflict', {
        requestId: context?.requestId || null,
        reason: 'duplicate_key',
        email: normalizedEmail,
        tenantId,
      });
      throw new AppError('User already exists in this tenant', 409);
    }
    throw err;
  }

  const token = signToken(user);
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
    },
  };
};

const loginUser = async ({ email, password }, context) => {
  const normalizedEmail = normalizeEmail(email);
  const { tenantId, source } = await resolveTenantForLogin(normalizedEmail, context);

  logger.info('Auth login tenant resolution', {
    requestId: context?.requestId || null,
    email: normalizedEmail,
    tenantId: tenantId || null,
    source,
  });

  if (!tenantId) {
    throw new AppError('Tenant ID is required', 400);
  }

  const user = await User.findOne(withTenant(tenantId, { email: normalizedEmail })).select(
    '+password'
  );
  logger.info('Auth login lookup', {
    requestId: context?.requestId || null,
    email: normalizedEmail,
    tenantId,
    found: Boolean(user),
    userId: user?._id || null,
  });
  if (!user) {
    const otherTenantUser = await User.findOne({ email: normalizedEmail }).select('tenantId');
    if (otherTenantUser) {
      logger.info('Auth login tenant mismatch', {
        requestId: context?.requestId || null,
        email: normalizedEmail,
        requestedTenantId: tenantId,
        actualTenantId: otherTenantUser.tenantId,
      });
    }
    throw new AppError('Invalid credentials', 401);
  }

  const match = await user.comparePassword(password);
  if (!match) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = signToken(user);
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
    },
  };
};

module.exports = { registerUser, loginUser };
