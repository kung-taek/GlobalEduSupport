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
    (req, res, next) => {
        console.log('🛠️ /google 라우터 진입!');
        next();
    },
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth 로그인 완료 후 콜백 처리
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.send('✅ Google 로그인 성공!');
});

// 인증 테스트용 엔드포인트
router.get('/test', (req, res) => {
    res.send('✅ 테스트 라우터 성공!');
});

export default router;
