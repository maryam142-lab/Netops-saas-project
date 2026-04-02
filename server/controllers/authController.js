const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');
const { logger } = require('../utils/logger');

const register = async (req, res) => {
  const email = (req.body?.email || '').trim().toLowerCase();
  const fallbackTenantId = process.env.DEFAULT_TENANT_ID || 'default_tenant';
  const tenantId =
    req.context?.tenantId || req.tenantId || req.body?.tenantId || fallbackTenantId;

  console.log('EMAIL:', email);
  console.log('TENANT_ID:', tenantId);
  console.log('REGISTER INPUT:', { email, tenantId });

  logger.info('Auth register request', {
    requestId: req.context?.requestId || null,
    email,
    tenantId,
  });

  req.context = req.context || {};
  req.context.tenantId = tenantId;
  req.tenantId = tenantId;

  const result = await authService.registerUser(req.body, req.context);
  return sendSuccess(res, result, 'Registration successful', 201);
};

const login = async (req, res) => {
  const result = await authService.loginUser(req.body, req.context);
  return sendSuccess(res, result, 'Login successful');
};

const profile = async (req, res) => {
  return sendSuccess(res, { user: req.user }, 'Profile loaded');
};

module.exports = { register, login, profile };
