const router = require('express').Router();
const {
  generateBill,
  listBills,
  markBillPaid,
  runMonthlyBilling,
  payAllBills,
} = require('../controllers/billingController');
const { protect, isAdmin } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.use(protect);

router.post('/generate', isAdmin, asyncHandler(generateBill));
router.post('/run-monthly', isAdmin, asyncHandler(runMonthlyBilling));
router.get('/', isAdmin, asyncHandler(listBills));
router.post('/mark-paid/:id', asyncHandler(markBillPaid));
router.post('/pay-all', asyncHandler(payAllBills));

module.exports = router;
