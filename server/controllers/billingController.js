const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const { generateMonthlyBills } = require('../services/billingService');

const generateBill = async (req, res) => {
  try {
    const { customerId, connectionId, amount, dueDate, month } = req.body;

    if (!customerId || !connectionId || amount === undefined || !dueDate || !month) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'customerId, connectionId, amount, dueDate, and month are required',
        });
    }

    const bill = await Bill.create({
      customerId,
      connectionId,
      amount,
      dueDate,
      month,
    });

    return res.status(201).json(bill);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate bill' });
  }
};

const listBills = async (req, res) => {
  try {
    const { customerId, status, month } = req.query;
    const filter = {};
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;
    if (month) filter.month = month;

    const bills = await Bill.find(filter)
      .populate('customerId', 'name email phone address')
      .sort({ dueDate: -1 });
    return res.json(bills);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch bills' });
  }
};

const markBillPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { method, amount, paymentDate } = req.body;

    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (req.user?.role === 'customer' && String(bill.customerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Bill is already paid' });
    }

    bill.status = 'paid';
    await bill.save();

    if (method) {
      await Payment.create({
        billId: bill._id,
        amount: amount === undefined ? bill.amount : amount,
        method,
        paymentDate,
      });
    }

    return res.json(bill);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to mark bill as paid' });
  }
};

const payAllBills = async (req, res) => {
  try {
    if (req.user?.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bills = await Bill.find({ customerId: req.user._id, status: 'unpaid' });
    if (bills.length === 0) {
      return res.json({ success: true, message: 'No unpaid bills found', paid: 0 });
    }

    const billIds = bills.map((bill) => bill._id);
    await Bill.updateMany({ _id: { $in: billIds } }, { $set: { status: 'paid' } });

    const payments = bills.map((bill) => ({
      billId: bill._id,
      amount: bill.amount,
      method: 'manual',
      paymentDate: new Date(),
    }));
    await Payment.insertMany(payments);

    return res.json({ success: true, message: 'All unpaid bills paid', paid: bills.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to pay bills' });
  }
};

const runMonthlyBilling = async (req, res) => {
  try {
    const runDate = req.body?.runDate ? new Date(req.body.runDate) : new Date();
    if (Number.isNaN(runDate.getTime())) {
      return res.status(400).json({ success: false, message: 'runDate is invalid' });
    }

    const result = await generateMonthlyBills(runDate);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to run monthly billing' });
  }
};

module.exports = { generateBill, listBills, markBillPaid, payAllBills, runMonthlyBilling };
