const express = require('express');
const { handleGPTMessage } = require('../controllers/gptController.js');

const router = express.Router();

router.post('/', handleGPTMessage);

module.exports = router;
