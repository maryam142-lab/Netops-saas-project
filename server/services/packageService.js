const Package = require('../models/Package');
const { AppError } = require('../utils/appError');
const { requireTenantId, withTenant, ensureTenantInPayload } = require('../utils/tenant');

const listPackages = async (context) => {
  const tenantId = requireTenantId(context?.tenantId);
  return Package.find(withTenant(tenantId));
};

const createPackage = async ({ name, speed, price, duration, description }, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  return Package.create(
    ensureTenantInPayload(tenantId, { name, speed, price, duration, description })
  );
};

const updatePackage = async (id, payload, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  const pkg = await Package.findOne(withTenant(tenantId, { _id: id }));
  if (!pkg) {
    throw new AppError('Package not found', 404);
  }

  const { name, speed, price, duration, description } = payload;
  if (name !== undefined) pkg.name = name;
  if (speed !== undefined) pkg.speed = speed;
  if (price !== undefined) pkg.price = price;
  if (duration !== undefined) pkg.duration = duration;
  if (description !== undefined) pkg.description = description;

  await pkg.save();
  return pkg;
};

const deletePackage = async (id, context) => {
  const tenantId = requireTenantId(context?.tenantId);
  const pkg = await Package.findOne(withTenant(tenantId, { _id: id }));
  if (!pkg) {
    throw new AppError('Package not found', 404);
  }
  await pkg.deleteOne();
};

module.exports = { listPackages, createPackage, updatePackage, deletePackage };
