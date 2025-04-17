import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// 회원가입 라우트
router.post('/register', register);

// 로그인 라우트
router.post('/login', login);

export default router;
