const crypto = require('crypto');
const { handleError } = require('../server/utils/errorHandler');
const { sendError } = require('../server/utils/response');
const { logger } = require('../server/utils/logger');

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

const parseRequest = async (req) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  req.query = Object.fromEntries(url.searchParams.entries());
  req.params = req.params || {};

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
    const raw = await readBody(req);
    if (raw) {
      try {
        req.body = JSON.parse(raw);
      } catch (err) {
        const error = new Error('Invalid JSON body');
        error.statusCode = 400;
        throw error;
      }
    } else {
      req.body = {};
    }
  } else {
    req.body = {};
  }

  return url;
};

const runMiddlewares = async (req, res, middlewares, handler) => {
  let index = 0;

  const next = async (err) => {
    if (err) throw err;
    if (res.writableEnded) return;
    const middleware = middlewares[index++];
    if (middleware) {
      return middleware(req, res, next);
    }
    return handler(req, res);
  };

  await next();
};

const initRequestContext = (req, res) => {
  const requestId = crypto.randomUUID();
  req.context = {
    requestId,
    startTime: Date.now(),
  };
  res.locals = res.locals || {};
  res.locals.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - req.context.startTime;
    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.url,
      status: res.statusCode,
      durationMs,
      userId: req.user?._id || null,
      tenantId: req.tenantId || null,
    });
  });
};

const handleRequest = async (req, res, fn) => {
  initRequestContext(req, res);
  try {
    await fn();
  } catch (err) {
    return handleError(err, res);
  }
};

const sendNotFound = (res) => {
  return sendError(res, 'Not Found', 404);
};

module.exports = { parseRequest, runMiddlewares, handleRequest, sendNotFound };
