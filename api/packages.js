const connectDB = require('../server/config/db');
const {
  listPackages,
  createPackage,
  updatePackage,
  deletePackage,
} = require('../server/controllers/packageController');
const { protect, isAdmin } = require('../server/middleware/auth');
const { rateLimitMiddleware } = require('../server/middleware/rateLimit');
const { packageCreateSchema } = require('../server/validation/schemas');
const { validateBody } = require('../server/validation/validate');
const { parseRequest, runMiddlewares, handleRequest, sendNotFound } = require('./_shared');

module.exports = async (req, res) =>
  handleRequest(req, res, async () => {
    await connectDB();
    const url = await parseRequest(req);
    const path = url.pathname;

    const authChain = [protect, isAdmin, rateLimitMiddleware('general')];

    if (req.method === 'GET' && path === '/api/packages') {
      return runMiddlewares(req, res, authChain, listPackages);
    }

    if (req.method === 'POST' && path === '/api/packages') {
      return runMiddlewares(req, res, [...authChain, validateBody(packageCreateSchema)], createPackage);
    }

    const idMatch = path.match(/^\/api\/packages\/([^/]+)$/);
    if (idMatch && req.method === 'PUT') {
      req.params = { id: idMatch[1] };
      return runMiddlewares(req, res, authChain, updatePackage);
    }

    if (idMatch && req.method === 'DELETE') {
      req.params = { id: idMatch[1] };
      return runMiddlewares(req, res, authChain, deletePackage);
    }

    return sendNotFound(res);
  });
