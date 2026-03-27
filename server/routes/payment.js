const router = require('express').Router();
const { createCheckoutSession, stripeWebhook } = require('../controllers/paymentController');
const { protect, isCustomer } = require('../middleware/auth');

router.post('/create-session', protect, isCustomer, createCheckoutSession);
router.post('/webhook', stripeWebhook);

module.exports = router;
