import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import passport from './middleware/passport.js';
import { fileURLToPath } from 'url';
import { pool } from './models/database.js';
import axios from 'axios';

// 라우터 불러오기
import gptRouter from './routes/gpt.js';
import kakaoRouter from './routes/kakao.js';
import authRouter from './routes/auth.js';
import gptKakaoRouter from './routes/gptKakao.js';
import uiTextsRouter from './routes/uiTexts.js';

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
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/ui-texts', uiTextsRouter);

// 관리자용 UI 텍스트 입력 폼 (GET)
app.get('/admin/ui-texts', (req, res) => {
    res.send(`
        <h2>UI 텍스트 등록 (관리자용)</h2>
        <form method="POST" action="/admin/ui-texts">
            <label>페이지 이름(page_name): <input name="page_name" required></label><br>
            <label>엘리먼트 키(element_key): <input name="element_key" required></label><br>
            <label>한글 원문(original_text_ko): <input name="original_text_ko" required></label><br>
            <label>비밀번호: <input name="password" type="password" required></label><br>
            <button type="submit">값 적용</button>
        </form>
    `);
});

// 관리자용 UI 텍스트 등록/수정 (POST)
app.post('/admin/ui-texts', async (req, res) => {
    const { page_name, element_key, original_text_ko, password } = req.body;
    if (password !== 'globalhelper') {
        return res.status(403).send('비밀번호가 일치하지 않습니다.');
    }
    try {
        // 이미 존재하는지 확인
        const [rows] = await pool.query('SELECT * FROM ui_texts WHERE page_name = ? AND element_key = ?', [
            page_name,
            element_key,
        ]);
        if (rows.length === 0) {
            // 새 row 생성
            await pool.query('INSERT INTO ui_texts (page_name, element_key, original_text_ko) VALUES (?, ?, ?)', [
                page_name,
                element_key,
                original_text_ko,
            ]);
            res.send('새 UI 텍스트가 등록되었습니다.');
        } else {
            // 기존 row 수정
            await pool.query('UPDATE ui_texts SET original_text_ko = ? WHERE page_name = ? AND element_key = ?', [
                original_text_ko,
                page_name,
                element_key,
            ]);
            res.send('기존 UI 텍스트가 수정되었습니다.');
        }
    } catch (err) {
        res.status(500).send('DB 오류: ' + err.message);
    }
});

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
