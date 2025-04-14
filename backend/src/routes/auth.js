import express from 'express';
import { register, login } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 회원가입
router.post('/signup', (req, res) => {
    console.log('🔥 /signup 요청 도착!');
    res.send('회원가입 성공??');
});

// 로그인
router.post('/login', login);

// 로그인된 사용자 정보 확인 (JWT 필요)
// router.get('/me', authenticateToken, getMe);

export default router;
