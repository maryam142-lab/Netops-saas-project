const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema(
  {
    ispProfile: {
      name: { type: String, default: '' },
      address: { type: String, default: '' },
      contactEmail: { type: String, default: '' },
    },
    billingSettings: {
      currency: { type: String, default: 'USD' },
      billingDay: { type: Number, default: 1 },
    },
    notificationSettings: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
    },
    securitySettings: {
      mfaEnabled: { type: Boolean, default: false },
    },
    systemSettings: {
      maintenanceMode: { type: Boolean, default: false },
    },
    tenantId: { type: String, trim: true, required: true },
  },
  { timestamps: true }
);

adminSettingsSchema.index({ tenantId: 1 }, { unique: true });

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
