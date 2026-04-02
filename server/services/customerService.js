const Connection = require('../models/Connection');
const Package = require('../models/Package');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const UpgradeRequest = require('../models/UpgradeRequest');
const User = require('../models/User');
const { AppError } = require('../utils/appError');
const { requireTenantId, withTenant, ensureTenantInPayload } = require('../utils/tenant');

const requestConnection = async (userId, packageId, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  if (!packageId) {
    throw new AppError('packageId is required', 400);
  }

  const pkg = await Package.findOne(withTenant(tenantId, { _id: packageId }));
  if (!pkg) {
    throw new AppError('Package not found', 404);
  }

  const existing = await Connection.findOne(
    withTenant(tenantId, {
      customerId: userId,
      packageId,
      status: { $in: ['pending', 'active'] },
    })
  );
  if (existing) {
    throw new AppError('Connection already pending or active', 409);
  }

  return Connection.create(
    ensureTenantInPayload(tenantId, {
      customerId: userId,
      packageId,
      status: 'pending',
    })
  );
};

const listConnections = async (userId, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  return Connection.find(withTenant(tenantId, { customerId: userId })).populate(
    'packageId',
    'name speed price duration'
  );
};

const listPackages = async (context) => {
  const tenantId = requireTenantId(context?.tenantId);
  return Package.find(withTenant(tenantId));
};

const listBills = async (userId, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  return Bill.find(withTenant(tenantId, { customerId: userId })).sort({ dueDate: -1 });
};

const listPayments = async (userId, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  const bills = await Bill.find(withTenant(tenantId, { customerId: userId })).select('_id');
  const billIds = bills.map((bill) => bill._id);
  return Payment.find(withTenant(tenantId, { billId: { $in: billIds } })).sort({
    paymentDate: -1,
  });
};

const updateProfile = async (userId, payload, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  const { name, email, phone, address } = payload;
  const user = await User.findOne(withTenant(tenantId, { _id: userId })).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (email && email.toLowerCase() !== user.email) {
    const existing = await User.findOne(withTenant(tenantId, { email: email.toLowerCase() }));
    if (existing && String(existing._id) !== String(user._id)) {
      throw new AppError('Email already in use', 409);
    }
    user.email = email.toLowerCase();
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;

  await user.save();
  return user;
};

const changePassword = async (userId, currentPassword, newPassword, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  if (!currentPassword || !newPassword) {
    throw new AppError('currentPassword and newPassword are required', 400);
  }

  const user = await User.findOne(withTenant(tenantId, { _id: userId })).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const match = await user.comparePassword(currentPassword);
  if (!match) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();
};

const upgradeRequest = async (userId, packageId, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  if (!packageId) {
    throw new AppError('packageId is required', 400);
  }

  const pkg = await Package.findOne(withTenant(tenantId, { _id: packageId }));
  if (!pkg) {
    throw new AppError('Package not found', 404);
  }

  const connection = await Connection.findOne(
    withTenant(tenantId, {
      customerId: userId,
      status: 'active',
    })
  );
  if (!connection) {
    throw new AppError('Active connection not found', 404);
  }

  const existing = await UpgradeRequest.findOne(
    withTenant(tenantId, {
      customerId: userId,
      connectionId: connection._id,
      status: 'pending',
    })
  );
  if (existing) {
    throw new AppError('Upgrade request already pending', 409);
  }

  return UpgradeRequest.create(
    ensureTenantInPayload(tenantId, {
      customerId: userId,
      connectionId: connection._id,
      currentPackageId: connection.packageId,
      requestedPackageId: pkg._id,
      status: 'pending',
    })
  );
};

const listCustomers = async (context) => {
  const tenantId = requireTenantId(context?.tenantId);
  return User.find(withTenant(tenantId, { role: 'customer' })).select('-password');
};

const createCustomer = async ({ name, email, password, phone, address }, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  const existing = await User.findOne(withTenant(tenantId, { email: email.toLowerCase() }));
  if (existing) {
    throw new AppError('Email already in use', 409);
  }

  const user = await User.create(
    ensureTenantInPayload(tenantId, {
      name,
      email: email.toLowerCase(),
      password,
      role: 'customer',
      phone,
      address,
    })
  );

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    phone: user.phone,
    address: user.address,
    createdAt: user.createdAt,
  };
};

const updateCustomer = async (id, payload, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  const { name, email, password, phone, address } = payload;
  const user = await User.findOne(withTenant(tenantId, { _id: id })).select('+password');
  if (!user || user.role !== 'customer') {
    throw new AppError('Customer not found', 404);
  }

  if (email && email.toLowerCase() !== user.email) {
    const existing = await User.findOne(withTenant(tenantId, { email: email.toLowerCase() }));
    if (existing && String(existing._id) !== String(user._id)) {
      throw new AppError('Email already in use', 409);
    }
    user.email = email.toLowerCase();
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (password) user.password = password;

  await user.save();
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    phone: user.phone,
    address: user.address,
    createdAt: user.createdAt,
  };
};

const deleteCustomer = async (id, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  const user = await User.findOne(withTenant(tenantId, { _id: id }));
  if (!user || user.role !== 'customer') {
    throw new AppError('Customer not found', 404);
  }
  await user.deleteOne();
};

module.exports = {
  requestConnection,
  listConnections,
  listPackages,
  listBills,
  listPayments,
  updateProfile,
  changePassword,
  upgradeRequest,
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
