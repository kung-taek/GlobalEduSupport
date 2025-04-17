const express = require('express');
const { register, login } = require('../controllers/authController.js');

const router = express.Router();

// 회원가입 라우트
router.post('/signup', register);

// 로그인 라우트
router.post('/login', login);

module.exports = router;
