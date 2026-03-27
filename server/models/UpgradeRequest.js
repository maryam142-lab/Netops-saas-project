const mongoose = require('mongoose');

const upgradeRequestSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    connectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection', required: true },
    currentPackageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    requestedPackageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UpgradeRequest', upgradeRequestSchema);
