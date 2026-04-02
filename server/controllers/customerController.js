const customerService = require('../services/customerService');
const { sendSuccess } = require('../utils/response');

const requestConnection = async (req, res) => {
  const connection = await customerService.requestConnection(
    req.user._id,
    req.body.packageId,
    req.context
  );
  return sendSuccess(res, connection, 'Connection requested', 201);
};

const listConnections = async (req, res) => {
  const connections = await customerService.listConnections(req.user._id, req.context);
  return sendSuccess(res, connections, 'Connections fetched');
};

const listPackages = async (req, res) => {
  const packages = await customerService.listPackages(req.context);
  return sendSuccess(res, packages, 'Packages fetched');
};

const listBills = async (req, res) => {
  const bills = await customerService.listBills(req.user._id, req.context);
  return sendSuccess(res, bills, 'Bills fetched');
};

const listPayments = async (req, res) => {
  const payments = await customerService.listPayments(req.user._id, req.context);
  return sendSuccess(res, payments, 'Payments fetched');
};

const getProfile = async (req, res) => {
  return sendSuccess(res, req.user, 'Profile loaded');
};

const updateProfile = async (req, res) => {
  const user = await customerService.updateProfile(req.user._id, req.body, req.context);
  return sendSuccess(res, user, 'Profile updated');
};

const changePassword = async (req, res) => {
  await customerService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword,
    req.context
  );
  return sendSuccess(res, null, 'Password updated successfully');
};

const upgradeRequest = async (req, res) => {
  const request = await customerService.upgradeRequest(
    req.user._id,
    req.body.packageId,
    req.context
  );
  return sendSuccess(res, request, 'Upgrade request submitted', 201);
};

module.exports = {
  requestConnection,
  listConnections,
  listPackages,
  listBills,
  listPayments,
  getProfile,
  updateProfile,
  changePassword,
  upgradeRequest,
};
