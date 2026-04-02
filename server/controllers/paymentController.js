const Stripe = require('stripe');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const { requireTenantId, withTenant, ensureTenantInPayload } = require('../utils/tenant');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const createCheckoutSession = async (req, res) => {
  try {
    const { billId } = req.body;
    if (!billId) {
      return res.status(400).json({ success: false, message: 'billId is required' });
    }

    const tenantId = requireTenantId(req.context?.tenantId);
    const bill = await Bill.findOne(withTenant(tenantId, { _id: billId })).populate(
      'customerId',
      'name email'
    );
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (req.user?.role === 'customer' && String(bill.customerId?._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Bill is already paid' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Stripe is not configured' });
    }

    const currency = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
    const amountInCents = Math.round(Number(bill.amount) * 100);
    const successUrl =
      process.env.STRIPE_SUCCESS_URL ||
      'http://localhost:5173/billing/success?session_id={CHECKOUT_SESSION_ID}';
    const cancelUrl =
      process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/billing/cancel';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: String(bill._id),
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amountInCents,
            product_data: {
              name: `Internet Bill - ${bill.month}`,
              description: `Bill for ${bill.month}`,
            },
          },
        },
      ],
      metadata: {
        billId: String(bill._id),
        customerId: String(bill.customerId?._id || bill.customerId),
        tenantId,
      },
      customer_email: bill.customerId?.email,
    });

    return res.json({ id: session.id, url: session.url });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create session' });
  }
};

const stripeWebhook = async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ success: false, message: 'Stripe webhook not configured' });
  }

  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const billId = session.metadata?.billId || session.client_reference_id;

    if (billId) {
      try {
    const tenantId = session.metadata?.tenantId;
    if (!tenantId) {
      return res.json({ received: true });
    }

    const bill = await Bill.findOne(withTenant(tenantId, { _id: billId }));
    if (bill && bill.status !== 'paid') {
      bill.status = 'paid';
      await bill.save();
    }

    const existingPayment = await Payment.findOne(
      withTenant(tenantId, { stripeSessionId: session.id })
    );

        if (!existingPayment && bill) {
          const amount = session.amount_total ? session.amount_total / 100 : bill.amount;
      await Payment.create(
        ensureTenantInPayload(tenantId, {
          billId: bill._id,
          amount,
          method: 'stripe',
          paymentDate: session.created ? new Date(session.created * 1000) : new Date(),
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
        })
      );
        }
      } catch (err) {
        // Allow Stripe to stop retrying once we acknowledge the event.
      }
    }
  }

  return res.json({ received: true });
};

module.exports = { createCheckoutSession, stripeWebhook };
