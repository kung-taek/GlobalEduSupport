const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const passport = require('./middleware/passport');

// 라우터 불러오기
const gptRouter = require('./routes/gpt');
const kakaoRouter = require('./routes/kakao');
const authRouter = require('./routes/auth');
const gptKakaoRouter = require('./routes/gptKakao');

// DB 연결
const { pool } = require('./models/database');

// .env 파일 로드
dotenv.config();

const app = express();

// 미들웨어 설정
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);
app.use(express.json());

// 세션 설정
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'globalhelper_default_secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24시간
        },
        name: 'globalhelper.sid',
    })
);

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// 라우터 등록
app.use('/api/gpt', gptRouter);
app.use('/api/kakao', kakaoRouter);
app.use('/api/auth', authRouter);
app.use('/api/gpt-kakao', gptKakaoRouter);

// 루트 테스트
app.get('/', (req, res) => {
    res.send('✅ 백엔드 서버가 정상 작동 중입니다!');
});

// DB 연결 확인 후 서버 시작
const PORT = process.env.PORT || 5000;

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL 연결 성공!');
        connection.release();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ 서버 실행 중: http://0.0.0.0:${PORT}`);
        });
    } catch (err) {
        console.error('❌ MySQL 연결 실패:', err.message);
    }
})();
