const connectDB = require('../server/config/db');
const { register, login, profile } = require('../server/controllers/authController');
const { protect } = require('../server/middleware/auth');
const { rateLimitMiddleware } = require('../server/middleware/rateLimit');
const { authRegisterSchema, authLoginSchema } = require('../server/validation/schemas');
const { validateBody } = require('../server/validation/validate');
const { parseRequest, runMiddlewares, handleRequest, sendNotFound } = require('./_shared');

module.exports = async (req, res) =>
  handleRequest(req, res, async () => {
    await connectDB();
    const url = await parseRequest(req);
    const path = url.pathname;
    const tenantId = req.headers['x-tenant-id'] || '';
    req.tenantId = tenantId;
    req.context = req.context || {};
    req.context.tenantId = tenantId;

    if (req.method === 'POST' && path === '/api/auth/register') {
      return runMiddlewares(
        req,
        res,
        [rateLimitMiddleware('auth'), validateBody(authRegisterSchema)],
        register
      );
    }

    if (req.method === 'POST' && path === '/api/auth/login') {
      return runMiddlewares(
        req,
        res,
        [rateLimitMiddleware('auth'), validateBody(authLoginSchema)],
        login
      );
    }

    if (req.method === 'GET' && path === '/api/auth/profile') {
      return runMiddlewares(req, res, [protect, rateLimitMiddleware('general')], profile);
    }

    return sendNotFound(res);
  });
