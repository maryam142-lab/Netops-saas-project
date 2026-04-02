const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

tenantSchema.index({ status: 1 });

module.exports = mongoose.model('Tenant', tenantSchema);
