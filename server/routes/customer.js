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

router.use(protect, isCustomer);

router.post('/request-connection', requestConnection);
router.post('/upgrade-request', upgradeRequest);
router.get('/connections', listConnections);
router.get('/packages', listPackages);
router.get('/bills', listBills);
router.get('/payments', listPayments);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
