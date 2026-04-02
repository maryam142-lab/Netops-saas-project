const Connection = require('../models/Connection');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
require('../models/Package');
const { AppError } = require('../utils/appError');
const { requireTenantId, withTenant, ensureTenantInPayload } = require('../utils/tenant');

const getMonthKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getDueDateForMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month, 10, 23, 59, 59, 999);
};

const buildBillsForConnections = (connections, runDate) => {
  const monthKey = getMonthKey(runDate);
  const dueDate = getDueDateForMonth(runDate);
  const billsToInsert = [];

  for (const connection of connections) {
    const packagePrice = connection.packageId?.price;
    if (typeof packagePrice !== 'number') continue;

    billsToInsert.push({
      customerId: connection.customerId,
      connectionId: connection._id,
      amount: packagePrice,
      status: 'unpaid',
      dueDate,
      month: monthKey,
      tenantId: connection.tenantId,
    });
  }

  return { billsToInsert, monthKey };
};

const upsertBills = async (billsToInsert, monthKey) => {
  if (billsToInsert.length === 0) {
    return { created: 0, month: monthKey };
  }

  const ops = billsToInsert.map((bill) => ({
    updateOne: {
      filter: {
        tenantId: bill.tenantId,
        connectionId: bill.connectionId,
        month: bill.month,
      },
      update: { $setOnInsert: bill },
      upsert: true,
    },
  }));

  const result = await Bill.bulkWrite(ops, { ordered: false });
  return { created: result.upsertedCount || 0, month: monthKey };
};

const generateMonthlyBills = async (runDate = new Date(), context) => {
  const tenantId = requireTenantId(context?.tenantId);
  const connections = await Connection.find(withTenant(tenantId, { status: 'active' })).populate(
    'packageId',
    'price'
  );

  const { billsToInsert, monthKey } = buildBillsForConnections(connections, runDate);
  return upsertBills(billsToInsert, monthKey);
};

const generateBillForConnection = async (connectionId, runDate = new Date(), context) => {
  const tenantId = requireTenantId(context?.tenantId);
  const connection = await Connection.findOne(withTenant(tenantId, { _id: connectionId })).populate(
    'packageId',
    'price'
  );
  const { billsToInsert, monthKey } = buildBillsForConnections(
    connection && connection.status === 'active' ? [connection] : [],
    runDate
  );
  return upsertBills(billsToInsert, monthKey);
};

const createBill = async ({ customerId, connectionId, amount, dueDate, month }, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  return Bill.create(
    ensureTenantInPayload(tenantId, {
      customerId,
      connectionId,
      amount,
      dueDate,
      month,
    })
  );
};

const listBills = async ({ customerId, status, month }, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  const filter = {};
  if (customerId) filter.customerId = customerId;
  if (status) filter.status = status;
  if (month) filter.month = month;

  return Bill.find(withTenant(tenantId, filter))
    .populate('customerId', 'name email phone address')
    .sort({ dueDate: -1 });
};

const markBillPaid = async ({ billId, user, method, amount, paymentDate }, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  const bill = await Bill.findOne(withTenant(tenantId, { _id: billId }));
  if (!bill) {
    throw new AppError('Bill not found', 404);
  }

  if (user?.role === 'customer' && String(bill.customerId) !== String(user._id)) {
    throw new AppError('Not authorized', 403);
  }

  if (bill.status === 'paid') {
    throw new AppError('Bill is already paid', 400);
  }

  bill.status = 'paid';
  await bill.save();

  if (method) {
    await Payment.create(
      ensureTenantInPayload(tenantId, {
        billId: bill._id,
        amount: amount === undefined ? bill.amount : amount,
        method,
        paymentDate,
      })
    );
  }

  return bill;
};

const payAllBills = async (user, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  if (user?.role !== 'customer') {
    throw new AppError('Not authorized', 403);
  }

  const bills = await Bill.find(
    withTenant(tenantId, { customerId: user._id, status: 'unpaid' })
  );
  if (bills.length === 0) {
    return { paid: 0 };
  }

  const billIds = bills.map((bill) => bill._id);
  await Bill.updateMany(
    withTenant(tenantId, { _id: { $in: billIds } }),
    { $set: { status: 'paid' } }
  );

  const payments = bills.map((bill) => ({
    billId: bill._id,
    amount: bill.amount,
    method: 'manual',
    paymentDate: new Date(),
  }));
  await Payment.insertMany(payments.map((payment) => ensureTenantInPayload(tenantId, payment)));

  return { paid: bills.length };
};

const runMonthlyBilling = async (runDate = new Date(), context) => {
  if (Number.isNaN(runDate.getTime())) {
    throw new AppError('runDate is invalid', 400);
  }

  return generateMonthlyBills(runDate, context);
};

module.exports = {
  generateMonthlyBills,
  generateBillForConnection,
  createBill,
  listBills,
  markBillPaid,
  payAllBills,
  runMonthlyBilling,
};
