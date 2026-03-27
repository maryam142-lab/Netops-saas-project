const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
