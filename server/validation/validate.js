const { AppError } = require('../utils/appError');

const normalizeIssues = (details) =>
  details.map((detail) => ({
    message: detail.message,
    path: detail.path.join('.'),
  }));

const validatePayload = (schema, data, source = 'body') => {
  const { value, error } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new AppError('Validation failed', 400, {
      source,
      issues: normalizeIssues(error.details),
    });
  }

  return value;
};

const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = validatePayload(schema, req.body, 'body');
    return next();
  } catch (err) {
    return next(err);
  }
};

const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = validatePayload(schema, req.query, 'query');
    return next();
  } catch (err) {
    return next(err);
  }
};

const validateParams = (schema) => (req, res, next) => {
  try {
    req.params = validatePayload(schema, req.params, 'params');
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { validateBody, validateQuery, validateParams, validatePayload };
