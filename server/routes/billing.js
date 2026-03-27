const router = require('express').Router();
const {
  generateBill,
  listBills,
  markBillPaid,
  runMonthlyBilling,
  payAllBills,
} = require('../controllers/billingController');
const { protect, isAdmin } = require('../middleware/auth');

router.use(protect);

router.post('/generate', isAdmin, generateBill);
router.post('/run-monthly', isAdmin, runMonthlyBilling);
router.get('/', isAdmin, listBills);
router.post('/mark-paid/:id', markBillPaid);
router.post('/pay-all', payAllBills);

module.exports = router;
