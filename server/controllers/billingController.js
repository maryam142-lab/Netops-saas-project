const billingService = require('../services/billingService');
const { sendSuccess } = require('../utils/response');

const generateBill = async (req, res) => {
  const bill = await billingService.createBill(req.body, req.context);
  return sendSuccess(res, bill, 'Bill generated', 201);
};

const listBills = async (req, res) => {
  const bills = await billingService.listBills(req.query, req.context);
  return sendSuccess(res, bills, 'Bills fetched');
};

const markBillPaid = async (req, res) => {
  const bill = await billingService.markBillPaid({
    billId: req.params.id,
    user: req.user,
    method: req.body?.method,
    amount: req.body?.amount,
    paymentDate: req.body?.paymentDate,
  }, req.context);
  return sendSuccess(res, bill, 'Bill marked as paid');
};

const payAllBills = async (req, res) => {
  const result = await billingService.payAllBills(req.user, req.context);
  return sendSuccess(res, result, 'All unpaid bills paid');
};

const runMonthlyBilling = async (req, res) => {
  const runDate = req.body?.runDate ? new Date(req.body.runDate) : new Date();
  const result = await billingService.runMonthlyBilling(runDate, req.context);
  return sendSuccess(res, result, 'Monthly billing completed');
};

module.exports = { generateBill, listBills, markBillPaid, payAllBills, runMonthlyBilling };
