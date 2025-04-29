import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
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
const allowedOrigins = [
    'http://globalhelper.p-e.kr',
    'http://globalhelper.p-e.kr:5000',
    'http://localhost:5173',
    'http://localhost:3000',
];

// 미들웨어 설정
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) {
                return callback(null, true);
            }

            const cleanedOrigin = origin.trim().toLowerCase();
            const allowed = allowedOrigins.map((o) => o.trim().toLowerCase());

            if (allowed.includes(cleanedOrigin)) {
                callback(null, true);
            } else {
                console.error('❌ 차단된 Origin 요청:', origin);
                callback(null, false); // ❗ 에러 객체를 넘기지 말고 false만 넘겨야 한다
            }
        },
        credentials: true,
    })
);

app.use((err, req, res, next) => {
    if (err && err.message && err.message.startsWith('Not allowed by CORS')) {
        return res.status(403).json({ error: 'CORS 차단됨' });
    }
    next(err);
});

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

// 메인화면에 관리자용 UI 텍스트 입력 폼 노출 (GET /)
app.get('/', async (req, res) => {
    try {
        // 모든 컬럼 정보 가져오기
        const [columns] = await pool.query(
            `
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'ui_texts' 
            AND TABLE_SCHEMA = ?
        `,
            [process.env.DB_NAME || 'AWS_DB']
        );

        // 모든 데이터 가져오기
        const [rows] = await pool.query('SELECT * FROM ui_texts');

        // HTML 테이블 생성
        const columnNames = columns.map((col) => col.COLUMN_NAME);
        const tableHeaders = columnNames.map((name) => `<th>${name}</th>`).join('');
        const tableRows = rows
            .map((row) => {
                const deleteButton = `
                <form method="POST" action="/delete" style="display: inline;">
                    <input type="hidden" name="page_name" value="${row.page_name}">
                    <input type="hidden" name="element_key" value="${row.element_key}">
                    <input type="password" name="password" placeholder="비밀번호" required style="width: 80px;">
                    <button type="submit" style="color: red; cursor: pointer;">❌</button>
                </form>
            `;
                return `<tr>
                ${columnNames.map((col) => `<td>${row[col] || ''}</td>`).join('')}
                <td>${deleteButton}</td>
            </tr>`;
            })
            .join('');

        res.send(`
            <h3>✅ 백엔드 서버 정상 가동!</h3>
            <br>
            <hr>
            <h2>UI 텍스트 등록 (관리자용)</h2>
            <form method="POST" action="/">
                <label>페이지 이름(page_name): <input name="page_name" required></label><br>
                <label>엘리먼트 키(element_key): <input name="element_key" required></label><br>
                <label>한글 원문(original_text_ko): <input name="original_text_ko" required></label><br>
                <label>비밀번호: <input name="password" type="password" required></label><br>
                <button type="submit">값 적용</button>
            </form>

            <hr>
            <h2>UI 텍스트 수정 (관리자용)</h2>
            <form method="POST" action="/update">
                <label>페이지 이름(page_name): <input name="page_name" required></label><br>
                <label>엘리먼트 키(element_key): <input name="element_key" required></label><br>
                <label>새로운 한글 원문(new_text_ko): <input name="new_text_ko" required></label><br>
                <label>비밀번호: <input name="password" type="password" required></label><br>
                <button type="submit">텍스트 수정</button>
            </form>

            <hr>
            <h2>데이터베이스 현재 상태</h2>
            <style>
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                tr:hover {
                    background-color: #f5f5f5;
                }
                .delete-btn {
                    background: none;
                    border: none;
                    color: red;
                    cursor: pointer;
                }
                .delete-form {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .password-input {
                    width: 80px;
                    padding: 2px 5px;
                }
            </style>
            <table>
                <thead>
                    <tr>
                        ${tableHeaders}
                        <th>작업</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `);
    } catch (err) {
        res.status(500).send('데이터베이스 조회 중 오류 발생: ' + err.message);
    }
});

// 메인화면에서 입력된 값 처리 (POST /)
app.post('/', async (req, res) => {
    const { page_name, element_key, original_text_ko, password } = req.body;
    if (password !== 'globalhelper') {
        return res.status(403).send('비밀번호가 일치하지 않습니다.<br><a href="/">돌아가기</a>');
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
            res.send('새 UI 텍스트가 등록되었습니다.<br><a href="/">돌아가기</a>');
        } else {
            // 기존 row 수정
            await pool.query('UPDATE ui_texts SET original_text_ko = ? WHERE page_name = ? AND element_key = ?', [
                original_text_ko,
                page_name,
                element_key,
            ]);
            res.send('기존 UI 텍스트가 수정되었습니다.<br><a href="/">돌아가기</a>');
        }
    } catch (err) {
        res.status(500).send('DB 오류: ' + err.message + '<br><a href="/">돌아가기</a>');
    }
});

// UI 텍스트 수정 처리 (POST /update)
app.post('/update', async (req, res) => {
    const { page_name, element_key, new_text_ko, password } = req.body;

    if (password !== 'globalhelper') {
        return res.status(403).send('비밀번호가 일치하지 않습니다.<br><a href="/">돌아가기</a>');
    }

    try {
        // 해당 텍스트가 존재하는지 확인
        const [rows] = await pool.query('SELECT * FROM ui_texts WHERE page_name = ? AND element_key = ?', [
            page_name,
            element_key,
        ]);

        if (rows.length === 0) {
            return res.status(404).send('수정할 UI 텍스트를 찾을 수 없습니다.<br><a href="/">돌아가기</a>');
        }

        // 텍스트 업데이트
        await pool.query('UPDATE ui_texts SET original_text_ko = ? WHERE page_name = ? AND element_key = ?', [
            new_text_ko,
            page_name,
            element_key,
        ]);

        res.send('UI 텍스트가 성공적으로 수정되었습니다.<br><a href="/">돌아가기</a>');
    } catch (err) {
        res.status(500).send('DB 오류: ' + err.message + '<br><a href="/">돌아가기</a>');
    }
});

// 삭제 처리를 위한 새로운 엔드포인트
app.post('/delete', async (req, res) => {
    const { page_name, element_key, password } = req.body;

    if (password !== 'globalhelper') {
        return res.status(403).send('비밀번호가 일치하지 않습니다.<br><a href="/">돌아가기</a>');
    }

    try {
        await pool.query('DELETE FROM ui_texts WHERE page_name = ? AND element_key = ?', [page_name, element_key]);
        res.send('UI 텍스트가 성공적으로 삭제되었습니다.<br><a href="/">돌아가기</a>');
    } catch (err) {
        res.status(500).send('DB 오류: ' + err.message + '<br><a href="/">돌아가기</a>');
    }
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
