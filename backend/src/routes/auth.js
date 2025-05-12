import express from 'express';
import { register, login } from '../controllers/authController.js';
import passport from 'passport';
import dotenv from 'dotenv';
import authenticateToken from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

dotenv.config();
const router = express.Router();

// 일반 회원가입 처리 부분
router.post('/register', register);

// 일반 로그인 처리
router.post('/login', login);

// Google OAuth 로그인 시작
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
        accessType: 'offline',
    })
);

// Google OAuth 콜백
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_login_failed`,
        session: false,
    }),
    (req, res) => {
        console.log('Google Callback - req.user:', req.user);
        console.log('Google Callback - token:', req.user?.token);
        console.log('Google Callback - FRONTEND_URL:', process.env.FRONTEND_URL);

        if (!req.user || !req.user.token) {
            console.error('Google Callback - No token found in req.user');
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_token`);
        }
        const token = req.user.token;
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}`;
        console.log('Google Callback - Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
    }
);

// 인증 테스트용 엔드포인트
router.get('/test', (req, res) => {
    res.send('✅ 테스트 라우터 성공!');
});

// 내 정보 조회 (로그인 상태 확인용)
router.get('/me', authenticateToken, async (req, res) => {
    try {
        // req.user는 JWT에서 복호화된 정보 (id, email 등)
        res.json({ id: req.user.id, email: req.user.email });
    } catch (err) {
        res.status(500).json({ error: '사용자 정보를 불러올 수 없습니다.' });
    }
});

export default router;
