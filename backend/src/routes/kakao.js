const express = require('express');
const { searchKeyword } = require('../controllers/kakaoController.js');

const router = express.Router();

router.post('/search', searchKeyword);

module.exports = router;
