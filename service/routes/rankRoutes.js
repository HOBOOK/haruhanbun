const express = require('express');
const router = express.Router();
const controller = require('../controllers/rankController');

// GET /hello/
router.get('/', controller.get);

module.exports = router;
