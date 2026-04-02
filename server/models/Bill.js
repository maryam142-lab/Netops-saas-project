const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    connectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection', required: true },
    tenantId: { type: String, trim: true, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    dueDate: { type: Date, required: true },
    month: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

billSchema.index({ tenantId: 1, connectionId: 1, month: 1 }, { unique: true });
billSchema.index({ tenantId: 1, customerId: 1 });
billSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('Bill', billSchema);
