const router = require('express').Router();
const { register, login, profile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, profile);

module.exports = router;
