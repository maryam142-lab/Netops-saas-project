const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Connection = require('../models/Connection');

const sendAsCsv = (res, filename, rows) => {
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  return res.send(csv);
};

const sendAsPdf = (res, title, rows) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);
  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);
  doc.fontSize(18).text(title, { align: 'left' });
  doc.moveDown();
  doc.fontSize(11);
  rows.forEach((row) => {
    const line = Object.entries(row)
      .map(([key, value]) => `${key}: ${value}`)
      .join('   ');
    doc.text(line);
  });
  doc.end();
};

const formatMonth = (value) => {
  if (!value) return '';
  return value;
};

const customerGrowthReport = async (req, res) => {
  try {
    const format = (req.query.format || 'json').toLowerCase();
    const data = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const rows = data.map((row) => ({
      month: formatMonth(row._id),
      customers: row.count,
    }));

    if (format === 'csv') return sendAsCsv(res, 'customer-growth', rows);
    if (format === 'pdf') return sendAsPdf(res, 'customer-growth', rows);

    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to build customer growth report' });
  }
};

const monthlyRevenueReport = async (req, res) => {
  try {
    const format = (req.query.format || 'json').toLowerCase();
    const data = await Payment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paymentDate' } },
          revenue: { $sum: '$amount' },
          payments: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const rows = data.map((row) => ({
      month: formatMonth(row._id),
      revenue: row.revenue,
      payments: row.payments,
    }));

    if (format === 'csv') return sendAsCsv(res, 'monthly-revenue', rows);
    if (format === 'pdf') return sendAsPdf(res, 'monthly-revenue', rows);

    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to build monthly revenue report' });
  }
};

const topPackagesReport = async (req, res) => {
  try {
    const format = (req.query.format || 'json').toLowerCase();
    const limit = Math.max(Number(req.query.limit) || 5, 1);
    const data = await Connection.aggregate([
      {
        $group: {
          _id: '$packageId',
          customers: { $sum: 1 },
        },
      },
      { $sort: { customers: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'packages',
          localField: '_id',
          foreignField: '_id',
          as: 'package',
        },
      },
      { $unwind: { path: '$package', preserveNullAndEmptyArrays: true } },
    ]);

    const rows = data.map((row) => ({
      package: row.package?.name || 'Unknown',
      speed: row.package?.speed || '',
      price: row.package?.price || 0,
      customers: row.customers,
    }));

    if (format === 'csv') return sendAsCsv(res, 'top-packages', rows);
    if (format === 'pdf') return sendAsPdf(res, 'top-packages', rows);

    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to build top packages report' });
  }
};

module.exports = { customerGrowthReport, monthlyRevenueReport, topPackagesReport };
