const { healthCheck } = require('../controllers/healthController');

const router = require('express').Router();

router.get('/', healthCheck);

module.exports = router;
