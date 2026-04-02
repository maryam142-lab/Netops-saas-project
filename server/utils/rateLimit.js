const { Redis } = require('@upstash/redis');

let redis;
let warnedMissingRedis = false;
const getRedis = () => {
  if (!redis) {
    redis = Redis.fromEnv();
  }
  return redis;
};

const hasRedisEnv = () =>
  Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return String(forwarded).split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
};

const normalizePath = (path) => {
  if (!path) return 'unknown';
  return path.split('?')[0];
};

const RULES = {
  auth: {
    algorithm: 'sliding',
    windowSec: 300,
    limit: 5,
    burst: { windowSec: 10, limit: 3 },
  },
  payments: {
    algorithm: 'sliding',
    windowSec: 60,
    limit: 10,
    burst: { windowSec: 10, limit: 5 },
  },
  general: {
    algorithm: 'fixed',
    windowSec: 900,
    limit: 100,
  },
};

const getIdentifier = (req) => {
  if (req.user?._id) {
    return { scope: 'user', id: String(req.user._id) };
  }
  return { scope: 'ip', id: getClientIp(req) };
};

const slidingWindow = async (key, limit, windowSec) => {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const redisClient = getRedis();

  const pipeline = redisClient.pipeline();
  pipeline.zremrangebyscore(key, 0, now - windowMs);
  pipeline.zadd(key, { score: now, member: String(now) });
  pipeline.zcard(key);
  pipeline.expire(key, windowSec);

  const results = await pipeline.exec();
  const count = results?.[2] || 0;
  return count > limit;
};

const fixedWindow = async (key, limit, windowSec) => {
  const redisClient = getRedis();
  const current = await redisClient.incr(key);
  if (current === 1) {
    await redisClient.expire(key, windowSec);
  }
  return current > limit;
};

const rateLimit = async (req, ruleKey, endpointKey) => {
  if (!hasRedisEnv()) {
    if (!warnedMissingRedis) {
      warnedMissingRedis = true;
      console.warn('Upstash Redis env vars missing; rate limiting disabled.');
    }
    return { allowed: true };
  }
  const rule = RULES[ruleKey] || RULES.general;
  const { scope, id } = getIdentifier(req);
  const path = normalizePath(endpointKey || req.url);
  const baseKey = `rl:${ruleKey}:${scope}:${id}:${path}`;

  if (rule.algorithm === 'sliding') {
    const blocked = await slidingWindow(baseKey, rule.limit, rule.windowSec);
    if (blocked) return { allowed: false, retryAfter: rule.windowSec };
    if (rule.burst) {
      const burstKey = `${baseKey}:burst`;
      const burstBlocked = await slidingWindow(
        burstKey,
        rule.burst.limit,
        rule.burst.windowSec
      );
      if (burstBlocked) return { allowed: false, retryAfter: rule.burst.windowSec };
    }
    return { allowed: true };
  }

  const blocked = await fixedWindow(baseKey, rule.limit, rule.windowSec);
  return blocked ? { allowed: false, retryAfter: rule.windowSec } : { allowed: true };
};

module.exports = { rateLimit };
