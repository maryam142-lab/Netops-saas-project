const { AppError } = require('./appError');

const requireTenantId = (tenantId) => {
  if (!tenantId) {
    throw new AppError('Tenant ID is required', 400);
  }
  return tenantId;
};

const withTenant = (tenantId, filter = {}) => ({
  ...filter,
  tenantId: requireTenantId(tenantId),
});

const findByIdAndTenant = (Model, id, tenantId, projection, options) => {
  if (!id) {
    throw new AppError('Resource id is required', 400);
  }
  return Model.findOne(withTenant(tenantId, { _id: id }), projection, options);
};

const ensureTenantInPayload = (tenantId, payload = {}) => ({
  ...payload,
  tenantId: requireTenantId(tenantId),
});

module.exports = { requireTenantId, withTenant, findByIdAndTenant, ensureTenantInPayload };
