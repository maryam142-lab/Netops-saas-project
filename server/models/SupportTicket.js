const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: String, trim: true, required: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    replies: [
      {
        sender: { type: String, enum: ['customer', 'admin'], required: true },
        message: { type: String, required: true, trim: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

supportTicketSchema.index({ tenantId: 1, customerId: 1 });
supportTicketSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
