import express from 'express';
import { register, login } from '../controllers/authController.js';
import passport from 'passport';
import dotenv from 'dotenv';
import authenticateToken from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import { pool } from '../models/database.js';

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
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/userinfo.profile'],
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
        // DB에서 전체 정보 조회
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        const user = users[0];
        res.json({
            id: user.id,
            email: user.email,
            username: user.username,
            locale: user.locale,
        });
    } catch (err) {
        res.status(500).json({ error: '사용자 정보를 불러올 수 없습니다.' });
    }
});

// 사용자 locale 업데이트 API (이메일 기준)
router.post('/user/update-locale', authenticateToken, async (req, res) => {
    const { locale, email } = req.body;
    if (!email) return res.status(400).json({ error: '이메일이 필요합니다.' });
    try {
        await pool.query('UPDATE users SET locale = ? WHERE email = ?', [locale, email]);
        res.json({ success: true });
    } catch (err) {
        console.error('locale 업데이트 실패:', err);
        res.status(500).json({ error: 'locale 업데이트 실패' });
    }
});

export default router;
