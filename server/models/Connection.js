const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended'],
      default: 'pending',
    },
    installDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Connection', connectionSchema);
