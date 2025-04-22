import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import passport from './middleware/passport.js';
import { fileURLToPath } from 'url';

// 라우터 불러오기
import gptRouter from './routes/gpt.js';
import kakaoRouter from './routes/kakao.js';
import authRouter from './routes/auth.js';
import gptKakaoRouter from './routes/gptKakao.js';

// DB 연결
import { pool } from './models/database.js';

// ESM 환경에서 __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env 파일 로드
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// CORS 허용 도메인 설정
const allowedOrigins = ['http://globalhelper.p-e.kr', 'http://localhost:5173', 'http://localhost:3000'];

// 미들웨어 설정
app.use(
    cors({
        origin: function (origin, callback) {
            // 개발 환경일 경우 localhost도 허용
            if (
                !origin ||
                allowedOrigins.includes(origin) ||
                (process.env.NODE_ENV !== 'production' && origin?.includes('localhost'))
            ) {
                callback(null, true);
            } else {
                callback(new Error('CORS 차단: ' + origin));
            }
        },
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

//ㅋㅋㅋ
