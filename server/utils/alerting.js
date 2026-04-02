const { logger } = require('./logger');
const { Redis } = require('@upstash/redis');

let redis;
const getRedis = () => {
  if (!redis) {
    redis = Redis.fromEnv();
  }
  return redis;
};

const shouldDedupe = async (dedupeKey, ttlSeconds) => {
  if (!dedupeKey || !ttlSeconds) return false;
  try {
    const client = getRedis();
    const key = `alert:dedupe:${dedupeKey}`;
    const set = await client.set(key, '1', { nx: true, ex: ttlSeconds });
    return !set;
  } catch (err) {
    logger.warn('Alert dedupe failed', { error: err?.message });
    return false;
  }
};

const postJson = async (url, payload) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Alert webhook failed: ${res.status} ${text}`);
  }
};

const sendAlert = async ({
  level = 'warning',
  title,
  message,
  context = {},
  dedupeKey,
  dedupeSeconds = 300,
}) => {
  const severity = level.toLowerCase();

  if (await shouldDedupe(dedupeKey, dedupeSeconds)) {
    return;
  }

  const payload = {
    level: severity,
    title,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  const criticalWebhook = process.env.ALERT_CRITICAL_WEBHOOK_URL;
  const defaultWebhook = process.env.ALERT_WEBHOOK_URL;

  try {
    if (severity === 'critical' && criticalWebhook) {
      await postJson(criticalWebhook, payload);
    } else if (defaultWebhook) {
      await postJson(defaultWebhook, payload);
    }
  } catch (err) {
    logger.error('Alert delivery failed', {
      error: err?.message,
      level: severity,
      title,
    });
  }
};

module.exports = { sendAlert };
