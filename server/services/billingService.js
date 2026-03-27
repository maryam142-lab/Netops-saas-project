const Connection = require('../models/Connection');
const Bill = require('../models/Bill');
require('../models/Package');

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
      filter: { connectionId: bill.connectionId, month: bill.month },
      update: { $setOnInsert: bill },
      upsert: true,
    },
  }));

  const result = await Bill.bulkWrite(ops, { ordered: false });
  return { created: result.upsertedCount || 0, month: monthKey };
};

const generateMonthlyBills = async (runDate = new Date()) => {
  const connections = await Connection.find({ status: 'active' }).populate(
    'packageId',
    'price'
  );

  const { billsToInsert, monthKey } = buildBillsForConnections(connections, runDate);
  return upsertBills(billsToInsert, monthKey);
};

const generateBillForConnection = async (connectionId, runDate = new Date()) => {
  const connection = await Connection.findById(connectionId).populate('packageId', 'price');
  const { billsToInsert, monthKey } = buildBillsForConnections(
    connection && connection.status === 'active' ? [connection] : [],
    runDate
  );
  return upsertBills(billsToInsert, monthKey);
};

module.exports = { generateMonthlyBills, generateBillForConnection };
