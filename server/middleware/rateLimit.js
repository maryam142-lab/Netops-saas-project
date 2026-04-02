const { rateLimit } = require('../utils/rateLimit');
const { sendError } = require('../utils/response');

const rateLimitMiddleware = (ruleKey, endpointKey) => async (req, res, next) => {
  try {
    if (req.url && req.url.startsWith('/api/payment/webhook')) {
      return next();
    }
    const result = await rateLimit(req, ruleKey, endpointKey);
    if (!result.allowed) {
      if (result.retryAfter) {
        res.setHeader('Retry-After', String(result.retryAfter));
      }
      return sendError(res, 'Too many requests, try again later.', 429);
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { rateLimitMiddleware };
