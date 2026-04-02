const mongoose = require('mongoose');

const upgradeRequestSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    connectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection', required: true },
    tenantId: { type: String, trim: true, required: true },
    currentPackageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    requestedPackageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

upgradeRequestSchema.index({ tenantId: 1, customerId: 1 });
upgradeRequestSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('UpgradeRequest', upgradeRequestSchema);
