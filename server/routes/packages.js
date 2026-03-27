const router = require('express').Router();
const {
  listPackages,
  createPackage,
  updatePackage,
  deletePackage,
} = require('../controllers/packageController');
const { protect, isAdmin } = require('../middleware/auth');

router.use(protect, isAdmin);

router.get('/', listPackages);
router.post('/', createPackage);
router.put('/:id', updatePackage);
router.delete('/:id', deletePackage);

module.exports = router;
