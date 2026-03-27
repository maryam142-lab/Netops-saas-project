const router = require('express').Router();
const {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  revenueSummary,
  getSettings,
  updateSettings,
} = require('../controllers/adminController');
const { listAllTickets } = require('../controllers/supportController');
const { protect, isAdmin } = require('../middleware/auth');

router.use(protect, isAdmin);

router.get('/customers', listCustomers);
router.post('/customers', createCustomer);
router.put('/customers/:id', updateCustomer);
router.delete('/customers/:id', deleteCustomer);
router.get('/revenue-summary', revenueSummary);
router.get('/support', listAllTickets);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
