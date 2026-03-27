const SupportTicket = require('../models/SupportTicket');

const createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: 'Subject and message are required' });
    }

    const ticket = await SupportTicket.create({
      customerId: req.user._id,
      subject,
      message,
      status: 'open',
    });

    return res.status(201).json(ticket);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
};

const listMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ customerId: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
};

const replyToTicket = async (req, res) => {
  try {
    const { ticketId, message } = req.body;
    if (!ticketId || !message) {
      return res
        .status(400)
        .json({ success: false, message: 'ticketId and message are required' });
    }

    const ticket = await SupportTicket.findOne({
      _id: ticketId,
      customerId: req.user._id,
    });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.replies.push({ message, sender: 'customer' });
    ticket.status = 'open';

    await ticket.save();
    return res.json(ticket);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to reply to ticket' });
  }
};

const listAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await SupportTicket.findById(ticketId).populate(
      'customerId',
      'name email'
    );
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    return res.json(ticket);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch ticket' });
  }
};

const replyToTicketAdmin = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.replies.push({ message, sender: 'admin' });
    await ticket.save();
    return res.json(ticket);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to reply to ticket' });
  }
};

const closeTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    ticket.status = 'closed';
    await ticket.save();
    return res.json(ticket);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to close ticket' });
  }
};

module.exports = {
  createTicket,
  listMyTickets,
  replyToTicket,
  listAllTickets,
  getTicketById,
  replyToTicketAdmin,
  closeTicket,
};
