const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    tenantId: { type: String, trim: true, required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended'],
      default: 'pending',
    },
    installDate: { type: Date },
  },
  { timestamps: true }
);

connectionSchema.index({ tenantId: 1, customerId: 1 });
connectionSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('Connection', connectionSchema);
