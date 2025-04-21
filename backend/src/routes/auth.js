import express from 'express';
import { register, login } from '../controllers/authController.js';
import passport from 'passport';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// 일반 회원가입 처리
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
        if (!req.user || !req.user.token) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_token`);
        }
        const token = req.user.token;
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

// 인증 테스트용 엔드포인트
router.get('/test', (req, res) => {
    res.send('✅ 테스트 라우터 성공!');
});

export default router;
