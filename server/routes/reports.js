const router = require('express').Router();
const {
  customerGrowthReport,
  monthlyRevenueReport,
  topPackagesReport,
} = require('../controllers/reportController');
const { protect, isAdmin } = require('../middleware/auth');

router.use(protect, isAdmin);

router.get('/customer-growth', customerGrowthReport);
router.get('/monthly-revenue', monthlyRevenueReport);
router.get('/top-packages', topPackagesReport);

module.exports = router;
