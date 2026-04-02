const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tenantId: { type: String, trim: true, required: true },
    speed: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

packageSchema.index({ tenantId: 1, name: 1 });

module.exports = mongoose.model('Package', packageSchema);
