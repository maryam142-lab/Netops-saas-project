const mongoose = require('mongoose');

const billingRunSchema = new mongoose.Schema(
  {
    tenantId: { type: String, trim: true, required: true },
    month: { type: String, required: true, trim: true }, // YYYY-MM
    status: { type: String, enum: ['running', 'success', 'failed'], default: 'running' },
    lockExpiresAt: { type: Date },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    attempts: { type: Number, default: 0 },
    createdCount: { type: Number, default: 0 },
    errorMessage: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

billingRunSchema.index({ tenantId: 1, month: 1 }, { unique: true });
billingRunSchema.index({ tenantId: 1, lockExpiresAt: 1 });

module.exports = mongoose.model('BillingRun', billingRunSchema);
