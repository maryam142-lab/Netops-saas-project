const AdminSettings = require('../models/AdminSettings');
const Bill = require('../models/Bill');
const customerService = require('../services/customerService');
const { sendSuccess } = require('../utils/response');
const { validatePayload } = require('../validation/validate');
const { customerCreateSchema } = require('../validation/schemas');
const { requireTenantId, withTenant, ensureTenantInPayload } = require('../utils/tenant');

const listCustomers = async (req, res) => {
  const customers = await customerService.listCustomers(req.context);
  return sendSuccess(res, customers, 'Customers fetched');
};

const createCustomer = async (req, res) => {
  req.body = validatePayload(customerCreateSchema, req.body, 'body');
  const customer = await customerService.createCustomer(req.body, req.context);
  return sendSuccess(res, customer, 'Customer created', 201);
};

const updateCustomer = async (req, res) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body, req.context);
  return sendSuccess(res, customer, 'Customer updated');
};

const deleteCustomer = async (req, res) => {
  await customerService.deleteCustomer(req.params.id, req.context);
  return sendSuccess(res, null, 'Customer deleted');
};

const revenueSummary = async (req, res) => {
  const months = Math.max(1, Math.min(36, Number(req.query.months) || 12));

  const tenantId = requireTenantId(req.context?.tenantId);
  const summaries = await Bill.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: '$month',
        totalBilled: { $sum: '$amount' },
        totalPaid: {
          $sum: {
            $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0],
          },
        },
        paidCount: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] },
        },
        unpaidCount: {
          $sum: { $cond: [{ $eq: ['$status', 'unpaid'] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: months },
  ]);

  return sendSuccess(res, { months, summaries }, 'Revenue summary loaded');
};

const getSettings = async (req, res) => {
  const tenantId = requireTenantId(req.context?.tenantId);
  const settings = await AdminSettings.findOne(withTenant(tenantId));
  if (!settings) {
    const created = await AdminSettings.create(ensureTenantInPayload(tenantId, {}));
    return sendSuccess(res, created, 'Settings created');
  }
  return sendSuccess(res, settings, 'Settings loaded');
};

const updateSettings = async (req, res) => {
  const tenantId = requireTenantId(req.context?.tenantId);
  const payload = req.body || {};
  const settings = await AdminSettings.findOneAndUpdate(
    withTenant(tenantId),
    payload,
    {
      new: true,
      upsert: true,
    }
  );
  return sendSuccess(res, settings, 'Settings updated');
};

module.exports = {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  revenueSummary,
  getSettings,
  updateSettings,
};
