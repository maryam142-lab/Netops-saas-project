const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const packageRoutes = require('./routes/packages');
const connectionRoutes = require('./routes/connections');
const billingRoutes = require('./routes/billing');
const paymentRoutes = require('./routes/payment');
const reportRoutes = require('./routes/reports');
const customerRoutes = require('./routes/customer');
const supportRoutes = require('./routes/support');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/support', supportRoutes);

module.exports = app;
