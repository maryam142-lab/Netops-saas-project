const connectDB = require('../server/config/db');
const {
  requestConnection,
  listConnections,
  listPackages,
  listBills,
  listPayments,
  getProfile,
  updateProfile,
  changePassword,
  upgradeRequest,
} = require('../server/controllers/customerController');
const { protect, isCustomer } = require('../server/middleware/auth');
const { rateLimitMiddleware } = require('../server/middleware/rateLimit');
const { parseRequest, runMiddlewares, handleRequest, sendNotFound } = require('./_shared');

module.exports = async (req, res) =>
  handleRequest(req, res, async () => {
    await connectDB();
    const url = await parseRequest(req);
    const path = url.pathname.replace('/api/customer', '/api/customers');

    const authChain = [protect, isCustomer, rateLimitMiddleware('general')];

    if (req.method === 'POST' && path === '/api/customers/request-connection') {
      return runMiddlewares(req, res, authChain, requestConnection);
    }

    if (req.method === 'POST' && path === '/api/customers/upgrade-request') {
      return runMiddlewares(req, res, authChain, upgradeRequest);
    }

    if (req.method === 'GET' && path === '/api/customers/connections') {
      return runMiddlewares(req, res, authChain, listConnections);
    }

    if (req.method === 'GET' && path === '/api/customers/packages') {
      return runMiddlewares(req, res, authChain, listPackages);
    }

    if (req.method === 'GET' && path === '/api/customers/bills') {
      return runMiddlewares(req, res, authChain, listBills);
    }

    if (req.method === 'GET' && path === '/api/customers/payments') {
      return runMiddlewares(req, res, authChain, listPayments);
    }

    if (req.method === 'GET' && path === '/api/customers/profile') {
      return runMiddlewares(req, res, authChain, getProfile);
    }

    if (req.method === 'PUT' && path === '/api/customers/profile') {
      return runMiddlewares(req, res, authChain, updateProfile);
    }

    if (req.method === 'PUT' && path === '/api/customers/change-password') {
      return runMiddlewares(req, res, authChain, changePassword);
    }

    return sendNotFound(res);
  });
