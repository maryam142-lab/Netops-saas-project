const router = require('express').Router();
const { register, login, profile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody } = require('../validation/validate');
const { authRegisterSchema, authLoginSchema } = require('../validation/schemas');

router.post('/register', validateBody(authRegisterSchema), asyncHandler(register));
router.post('/login', validateBody(authLoginSchema), asyncHandler(login));
router.get('/profile', protect, asyncHandler(profile));

module.exports = router;
