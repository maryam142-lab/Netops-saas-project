const path = require('path');
const dotenv = require('dotenv');
const app = require('../server/app');
const connectDB = require('../server/config/db');
const { notFound, errorHandler } = require('../server/middleware/errorHandler');

// Load server env for local development (Vercel uses project env vars)
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

let isDbConnected = false;
const ensureDb = async () => {
  if (!isDbConnected) {
    await connectDB();
    isDbConnected = true;
  }
};

if (!app.locals._vercelConfigured) {
  app.use(notFound);
  app.use(errorHandler);
  app.locals._vercelConfigured = true;
}

module.exports = async (req, res) => {
  await ensureDb();
  return app(req, res);
};
