const router = require('express').Router();
const {
  createTicket,
  listMyTickets,
  replyToTicket,
  getTicketById,
  replyToTicketAdmin,
  closeTicket,
} = require('../controllers/supportController');
const { protect, isCustomer, isAdmin } = require('../middleware/auth');

router.use(protect);

router.post('/create', isCustomer, createTicket);
router.post('/create-ticket', isCustomer, createTicket);
router.get('/my-tickets', isCustomer, listMyTickets);
router.post('/reply', isCustomer, replyToTicket);

router.get('/:ticketId', isAdmin, getTicketById);
router.post('/reply/:ticketId', isAdmin, replyToTicketAdmin);
router.put('/close/:ticketId', isAdmin, closeTicket);

module.exports = router;
