const { handleError } = require('../utils/errorHandler');

const notFound = (req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  return handleError(err, res);
};

module.exports = { notFound, errorHandler };
