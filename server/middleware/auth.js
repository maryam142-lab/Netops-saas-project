const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : null;

    if (!token) {
      return sendError(res, 'Not authorized', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tenantId = decoded.tenantId;
    const user = await User.findOne({ _id: decoded.userId, tenantId }).select('-password');
    if (!user) {
      return sendError(res, 'Not authorized', 401);
    }

    req.user = user;
    req.tenantId = user.tenantId || decoded.tenantId || '';
    req.context = req.context || {};
    req.context.tenantId = req.tenantId;
    req.context.userId = String(user._id);
    return next();
  } catch (err) {
    if (err && err.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired', 401);
    }
    return sendError(res, 'Not authorized', 401);
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return sendError(res, 'Insufficient permissions', 403);
  }
  return next();
};

const requireTenant = (req, res, next) => {
  const requestedTenant =
    req.params?.tenantId || req.headers['x-tenant-id'] || req.body?.tenantId || '';

  if (!requestedTenant) {
    return sendError(res, 'Tenant ID is required', 400);
  }

  if (!req.tenantId || req.tenantId !== requestedTenant) {
    return sendError(res, 'Tenant access denied', 403);
  }

  return next();
};

const isAdmin = authorizeRoles('admin');
const isCustomer = authorizeRoles('customer');

module.exports = { protect, authorizeRoles, requireTenant, isAdmin, isCustomer };
