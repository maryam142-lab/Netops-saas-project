const router = require('express').Router();
const {
  requestConnection,
  listConnections,
  listPackages,
  listBills,
  listPayments,
  getProfile,
  updateProfile,
  changePassword,
  upgradeRequest,
} = require('../controllers/customerController');
const { protect, isCustomer } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.use(protect, isCustomer);

router.post('/request-connection', asyncHandler(requestConnection));
router.post('/upgrade-request', asyncHandler(upgradeRequest));
router.get('/connections', asyncHandler(listConnections));
router.get('/packages', asyncHandler(listPackages));
router.get('/bills', asyncHandler(listBills));
router.get('/payments', asyncHandler(listPayments));
router.get('/profile', asyncHandler(getProfile));
router.put('/profile', asyncHandler(updateProfile));
router.put('/change-password', asyncHandler(changePassword));

module.exports = router;
