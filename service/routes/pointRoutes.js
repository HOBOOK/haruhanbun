const express = require('express');
const router = express.Router();
const controller = require('../controllers/pointController');
const authenticate = require('../middlewares/auth.middleware');

// GET /hello/
router.post('/', authenticate, controller.record);

module.exports = router;
