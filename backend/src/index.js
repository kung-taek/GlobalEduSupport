// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import gptRouter from './routes/gpt.js';
import kakaoRouter from './routes/kakao.js';
import authRouter from './routes/auth.js';
import gptKakaoRouter from './routes/gptKakao.js';
import { pool } from './models/database.js';
import './middleware/passport.js'; // Initialize passport configuration

// ESM 환경에서 __dirname 정의
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ .env 경로 명시
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ✅ 실제로 환경변수가 잘 불러와지는지 확인
console.log('🔑 API KEY:', process.env.OPENAI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.use(
    session({
        secret: 'google_globalhelper_secret_key', // 원하는 비밀 키 (노출 주의)
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

//테스트222

// 환경 변수 확인
console.log('DB_HOST:', process.env.DB_HOST); // DB_HOST가 제대로 로드되는지 확인

// DB 연결 확인 및 서버 실행
console.log('✅ 0단계: index.js 실행 시작');

(async () => {
    try {
        console.log('✅ 1단계: DB 연결 시도');
        const connection = await pool.getConnection();
        console.log('✅ 2단계: DB 연결 성공');
        connection.release();

        console.log('✅ 3단계: 라우터 등록 전');
        app.use('/api/gpt', gptRouter);
        app.use('/api/kakao', kakaoRouter);
        app.use('/api/auth', authRouter);
        app.use('/api/gpt-kakao', gptKakaoRouter);
        console.log('✅ 4단계: 라우터 등록 완료');

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ 5단계: 서버 실행 중 http://0.0.0.0:${PORT}`);
        });
    } catch (err) {
        console.error('❌ 전체 실패:', err);
    }
})();
