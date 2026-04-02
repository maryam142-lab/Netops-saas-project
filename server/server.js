const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/db');
const cron = require('node-cron');
const { generateMonthlyBills } = require('./services/billingService');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const mongoose = require('mongoose');

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    try {
      const indexes = await mongoose.connection.db.collection('users').indexes();
      const hasEmailOnlyUnique = indexes.some(
        (index) =>
          index?.unique &&
          index?.key &&
          index.key.email === 1 &&
          Object.keys(index.key).length === 1
      );
      if (hasEmailOnlyUnique) {
        console.warn(
          'Warning: users collection has a unique index on email only. ' +
            'Drop email_1 and create a compound unique index on { tenantId: 1, email: 1 }.'
        );
      }
    } catch (indexErr) {
      console.warn('Unable to inspect users indexes:', indexErr?.message || indexErr);
    }
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    cron.schedule('0 0 1 * *', async () => {
      try {
        const result = await generateMonthlyBills();
        console.log(`Monthly billing job complete for ${result.month}. Created: ${result.created}`);
      } catch (err) {
        console.error('Monthly billing job failed:', err);
      }
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

start();
