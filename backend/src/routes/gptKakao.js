const express = require('express');
const { getLocationCoordinates } = require('../controllers/gptKakaoController.js');

const router = express.Router();

router.post('/gpt-location', getLocationCoordinates);

module.exports = router;
