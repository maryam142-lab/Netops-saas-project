const { sendError } = require('./response');
const { logger } = require('./logger');
const { sendAlert } = require('./alerting');

const normalizeMongooseError = (err) => {
  if (!err) return err;

  if (err.name === 'MongoServerError' && err.code === 11000) {
    const keys = Object.keys(err.keyPattern || err.keyValue || {});
    const field = keys[0] || 'field';
    return {
      statusCode: 409,
      message: `${field} already exists`,
      details: { key: field },
    };
  }

  if (err.name === 'ValidationError') {
    const issues = Object.values(err.errors || {}).map((item) => ({
      message: item.message,
      path: item.path,
    }));
    return {
      statusCode: 400,
      message: 'Validation error',
      details: { issues },
    };
  }

  if (err.name === 'CastError') {
    return {
      statusCode: 400,
      message: `Invalid ${err.path}`,
      details: { value: err.value },
    };
  }

  return err;
};

const handleError = (err, res) => {
  const normalized = normalizeMongooseError(err);
  const statusCode = normalized?.statusCode || 500;
  const message = normalized?.message || 'Server error';
  const details = normalized?.details || null;

  logger.error('Request error', {
    requestId: res?.locals?.requestId || null,
    statusCode,
    message,
    details,
    stack: err?.stack,
  });

  if (statusCode >= 500) {
    sendAlert({
      level: 'critical',
      title: 'Server error',
      message,
      context: {
        requestId: res?.locals?.requestId || null,
        statusCode,
        details,
      },
      dedupeKey: `error:${statusCode}:${message}`,
      dedupeSeconds: 300,
    });
  }

  return sendError(res, message, statusCode, details);
};

module.exports = { handleError };
