const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, required: true, trim: true },
    paymentDate: { type: Date, default: Date.now },
    stripeSessionId: { type: String, trim: true },
    stripePaymentIntentId: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
