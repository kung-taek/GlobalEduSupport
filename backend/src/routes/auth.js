import express from 'express';
import { register, login } from '../controllers/authController.js';
import passport from 'passport';

const router = express.Router();

// 회원가입 라우트
router.post('/register', register);

// 로그인 라우트
router.post('/login', login);

// 👇 Google 로그인 요청
router.get(
    '/google',
    (req, res, next) => {
        console.log('🛠️ /google 라우터 진입!');
        next();
    },
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 👇 Google 로그인 콜백 처리
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // 로그인 성공 시 처리 (응답 or 리디렉션)
    res.send('✅ Google 로그인 성공!');
    // 또는 프론트엔드 주소로 리디렉션
});

export default router;
