const Joi = require('joi');

const authRegisterSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'customer').optional(),
  phone: Joi.string().allow('', null).optional(),
  address: Joi.string().allow('', null).optional(),
  tenantId: Joi.string().trim().optional(),
});

const authLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  tenantId: Joi.string().trim().optional(),
});

const customerCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().allow('', null).optional(),
  address: Joi.string().allow('', null).optional(),
});

const packageCreateSchema = Joi.object({
  name: Joi.string().trim().required(),
  speed: Joi.alternatives(Joi.string(), Joi.number()).required(),
  price: Joi.number().required(),
  duration: Joi.alternatives(Joi.string(), Joi.number()).required(),
  description: Joi.string().allow('', null).optional(),
});

const billCreateSchema = Joi.object({
  customerId: Joi.string().required(),
  connectionId: Joi.string().required(),
  amount: Joi.number().required(),
  dueDate: Joi.date().iso().required(),
  month: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
});

const billingRunSchema = Joi.object({
  runDate: Joi.date().iso().optional(),
});

module.exports = {
  authRegisterSchema,
  authLoginSchema,
  customerCreateSchema,
  packageCreateSchema,
  billCreateSchema,
  billingRunSchema,
};
