const router = require('express').Router();
const {
  listPendingConnections,
  approveConnection,
  rejectConnection,
} = require('../controllers/connectionController');
const { protect, isAdmin } = require('../middleware/auth');

router.use(protect, isAdmin);

router.get('/pending', listPendingConnections);
router.post('/approve/:id', approveConnection);
router.post('/reject/:id', rejectConnection);

module.exports = router;
