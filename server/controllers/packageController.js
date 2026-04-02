const packageService = require('../services/packageService');
const { sendSuccess } = require('../utils/response');

const listPackages = async (req, res) => {
  const packages = await packageService.listPackages(req.context);
  return sendSuccess(res, packages, 'Packages fetched');
};

const createPackage = async (req, res) => {
  const pkg = await packageService.createPackage(req.body, req.context);
  return sendSuccess(res, pkg, 'Package created', 201);
};

const updatePackage = async (req, res) => {
  const pkg = await packageService.updatePackage(req.params.id, req.body, req.context);
  return sendSuccess(res, pkg, 'Package updated');
};

const deletePackage = async (req, res) => {
  await packageService.deletePackage(req.params.id, req.context);
  return sendSuccess(res, null, 'Package deleted');
};

module.exports = { listPackages, createPackage, updatePackage, deletePackage };
