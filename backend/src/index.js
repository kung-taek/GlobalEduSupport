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
import pool from './models/database.js';

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

//테스트222

// 환경 변수 확인
console.log('DB_HOST:', process.env.DB_HOST); // DB_HOST가 제대로 로드되는지 확인

// DB 연결 확인 및 서버 실행
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL 연결 성공!');
        connection.release();

        // DB 연결 성공 후 서버 실행
        app.get('/', (req, res) => {
            res.send('백엔드 서버 잘 작동 중!~~~');
        });

        app.use('/api/gpt', gptRouter);
        app.use('/api/kakao', kakaoRouter);
        app.use('/api/auth', authRouter);
        app.use('/api/gpt-kakao', gptKakaoRouter);

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ 서버 실행 중: http://0.0.0.0:${PORT}`);
        });
    } catch (err) {
        console.error('❌ MySQL 연결 실패:', err.message);
    }
})();
