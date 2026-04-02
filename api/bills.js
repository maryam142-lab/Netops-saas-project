const connectDB = require('../server/config/db');
const {
  generateBill,
  listBills,
  markBillPaid,
  runMonthlyBilling,
  payAllBills,
} = require('../server/controllers/billingController');
const { protect, isAdmin } = require('../server/middleware/auth');
const { rateLimitMiddleware } = require('../server/middleware/rateLimit');
const { billCreateSchema, billingRunSchema } = require('../server/validation/schemas');
const { validateBody } = require('../server/validation/validate');
const { parseRequest, runMiddlewares, handleRequest, sendNotFound } = require('./_shared');

module.exports = async (req, res) =>
  handleRequest(req, res, async () => {
    await connectDB();
    const url = await parseRequest(req);
    const path = url.pathname;

    if (req.method === 'POST' && path === '/api/bills/generate') {
      return runMiddlewares(
        req,
        res,
        [protect, isAdmin, rateLimitMiddleware('payments'), validateBody(billCreateSchema)],
        generateBill
      );
    }

    if (req.method === 'POST' && path === '/api/bills/run-monthly') {
      return runMiddlewares(
        req,
        res,
        [protect, isAdmin, rateLimitMiddleware('payments'), validateBody(billingRunSchema)],
        runMonthlyBilling
      );
    }

    if (req.method === 'GET' && path === '/api/bills') {
      return runMiddlewares(req, res, [protect, isAdmin, rateLimitMiddleware('general')], listBills);
    }

    const markPaidMatch = path.match(/^\/api\/bills\/mark-paid\/([^/]+)$/);
    if (markPaidMatch && req.method === 'POST') {
      req.params = { id: markPaidMatch[1] };
      return runMiddlewares(req, res, [protect, rateLimitMiddleware('payments')], markBillPaid);
    }

    if (req.method === 'POST' && path === '/api/bills/pay-all') {
      return runMiddlewares(req, res, [protect, rateLimitMiddleware('payments')], payAllBills);
    }

    return sendNotFound(res);
  });
