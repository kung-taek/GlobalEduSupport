import express from 'express';
import { register, login } from '../controllers/authController.js';
import passport from 'passport';

const router = express.Router();

// 일반 회원가입 처리
router.post('/register', register);

// 일반 로그인 처리
router.post('/login', login);

// Google OAuth 로그인 시작점
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account', // 항상 계정 선택 화면 표시
    })
);

// Google OAuth 로그인 완료 후 콜백 처리
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: 'http://13.124.18.66:3000/login?error=google_login_failed',
        session: false,
    }),
    (req, res) => {
        // 프론트엔드로 리다이렉트 (토큰 포함)
        const token = req.user.token;
        res.redirect(`http://13.124.18.66:3000/auth/callback?token=${token}`);
    }
);

// 인증 테스트용 엔드포인트
router.get('/test', (req, res) => {
    res.send('✅ 테스트 라우터 성공!');
});

export default router;
