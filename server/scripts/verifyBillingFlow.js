const dotenv = require('dotenv');
const http = require('http');
const app = require('../app');
const connectDB = require('../config/db');
const User = require('../models/User');
const Package = require('../models/Package');
const Connection = require('../models/Connection');
const Bill = require('../models/Bill');
const { signToken } = require('../utils/token');

dotenv.config();

const getMonthKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const startServer = () =>
  new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });

const apiRequest = async (url, token, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { raw: text };
  }

  if (!response.ok) {
    const message = data?.message || data?.raw || response.statusText;
    throw new Error(`Request failed (${response.status}): ${message}`);
  }

  return data;
};

const logCheck = (message) => {
  console.log(`✔ ${message}`);
};

const main = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Please set it in server/.env');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Please set it in server/.env');
  }

  let server;
  let port;
  const createdIds = {
    users: [],
    packages: [],
    connections: [],
    bills: [],
  };

  try {
    await connectDB();
    ({ server, port } = await startServer());

    const unique = Date.now();
    const admin = await User.create({
      name: `Verify Admin ${unique}`,
      email: `verify-admin-${unique}@example.com`,
      password: 'Test1234!',
      role: 'admin',
    });
    const customer = await User.create({
      name: `Verify Customer ${unique}`,
      email: `verify-customer-${unique}@example.com`,
      password: 'Test1234!',
      role: 'customer',
    });
    createdIds.users.push(admin._id, customer._id);

    const pkg = await Package.create({
      name: `Verify Package ${unique}`,
      speed: '50 Mbps',
      price: 49.99,
      duration: 1,
      description: 'Verification package',
    });
    createdIds.packages.push(pkg._id);

    const connection = await Connection.create({
      customerId: customer._id,
      packageId: pkg._id,
      status: 'pending',
    });
    createdIds.connections.push(connection._id);

    const adminToken = signToken(admin);
    const customerToken = signToken(customer);
    const baseUrl = `http://localhost:${port}/api`;

    await apiRequest(`${baseUrl}/connections/approve/${connection._id}`, adminToken, {
      method: 'POST',
    });

    const monthKey = getMonthKey(new Date());
    const bill = await Bill.findOne({
      connectionId: connection._id,
      month: monthKey,
    }).lean();

    if (!bill) {
      throw new Error('Bill not created after connection approval.');
    }
    createdIds.bills.push(bill._id);
    logCheck('Connection approval created bill');

    const billingResult = await apiRequest(`${baseUrl}/billing/run-monthly`, adminToken, {
      method: 'POST',
    });

    const billsForMonth = await Bill.find({
      connectionId: connection._id,
      month: monthKey,
    }).lean();
    if (billsForMonth.length !== 1) {
      throw new Error(
        `Duplicate bills detected for connection ${connection._id} in ${monthKey}.`
      );
    }
    logCheck('Monthly billing job created no duplicates');

    await apiRequest(`${baseUrl}/billing/mark-paid/${bill._id}`, customerToken, {
      method: 'POST',
      body: JSON.stringify({ method: 'manual' }),
    });

    const paidBill = await Bill.findById(bill._id).lean();
    if (!paidBill || paidBill.status !== 'paid') {
      throw new Error('Bill status was not updated to paid.');
    }
    logCheck('Payment updated bill status');

    console.log('Billing verification completed successfully.');
    if (billingResult) {
      console.log(`Billing run created: ${billingResult.created} bills for ${billingResult.month}.`);
    }
  } finally {
    try {
      if (createdIds.bills.length) {
        await Bill.deleteMany({ _id: { $in: createdIds.bills } });
      }
      if (createdIds.connections.length) {
        await Connection.deleteMany({ _id: { $in: createdIds.connections } });
      }
      if (createdIds.packages.length) {
        await Package.deleteMany({ _id: { $in: createdIds.packages } });
      }
      if (createdIds.users.length) {
        await User.deleteMany({ _id: { $in: createdIds.users } });
      }
    } catch (cleanupErr) {
      console.error('Cleanup failed:', cleanupErr.message || cleanupErr);
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    const mongoose = require('mongoose');
    await mongoose.connection.close();
  }
};

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
