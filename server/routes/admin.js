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
const asyncHandler = require('../utils/asyncHandler');

router.use(protect, isAdmin);

router.get('/customers', asyncHandler(listCustomers));
router.post('/customers', asyncHandler(createCustomer));
router.put('/customers/:id', asyncHandler(updateCustomer));
router.delete('/customers/:id', asyncHandler(deleteCustomer));
router.get('/revenue-summary', asyncHandler(revenueSummary));
router.get('/support', asyncHandler(listAllTickets));
router.get('/settings', asyncHandler(getSettings));
router.put('/settings', asyncHandler(updateSettings));

module.exports = router;
