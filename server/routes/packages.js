const router = require('express').Router();
const {
  listPackages,
  createPackage,
  updatePackage,
  deletePackage,
} = require('../controllers/packageController');
const { protect, isAdmin } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.use(protect, isAdmin);

router.get('/', asyncHandler(listPackages));
router.post('/', asyncHandler(createPackage));
router.put('/:id', asyncHandler(updatePackage));
router.delete('/:id', asyncHandler(deletePackage));

module.exports = router;
