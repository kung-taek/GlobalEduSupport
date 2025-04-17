const express = require('express');
const router = express.Router();
const { getLocationCoordinates } = require('../controllers/gptKakaoController');

router.post('/gpt-location', getLocationCoordinates);

module.exports = router;
