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

        res.send(`
            
            <div id="auth-section">
                <h3>✅ 백엔드 서버 정상 가동!</h3>
                <br>
                <input type="password" id="auth-password" placeholder="관리자 암호를 입력하세요">
                <button onclick="authenticate()">확인</button>
            </div>

            <div id="admin-content" style="display: none;">
                
                <hr>
                <h2>UI 텍스트 등록</h2>
                <form id="addForm" onsubmit="handleSubmit(event, 'add')" class="admin-form">
                    <div class="form-group">
                        <label>페이지 이름(page_name):</label>
                        <input name="page_name" required>
                    </div>
                    <div class="form-group">
                        <label>엘리먼트 키(element_key):</label>
                        <input name="element_key" required>
                    </div>
                    <div class="form-group">
                        <label>한글 원문(original_text_ko):</label>
                        <input name="original_text_ko" required>
                    </div>
                    <button type="submit">값 적용</button>
                </form>

                <hr>
                <h2>UI 텍스트 수정</h2>
                <form id="updateForm" onsubmit="handleSubmit(event, 'update')" class="admin-form">
                    <div class="form-group">
                        <label>페이지 이름(page_name):</label>
                        <input name="page_name" required>
                    </div>
                    <div class="form-group">
                        <label>엘리먼트 키(element_key):</label>
                        <input name="element_key" required>
                    </div>
                    <div class="form-group">
                        <label>새로운 한글 원문(new_text_ko):</label>
                        <input name="new_text_ko" required>
                    </div>
                    <button type="submit">텍스트 수정</button>
                </form>

                <hr>
                <h2>ui_texts 데이터베이스</h2>
                <style>
                    #auth-section {
                        margin: 20px 0;
                        padding: 20px;
                        text-align: center;
                    }
                    #auth-password {
                        padding: 5px;
                        margin-right: 10px;
                    }

                    /* 폼 스타일 추가 */
                    .admin-form {
                        max-width: 800px;
                        margin: 20px 0;
                    }

                    .form-group {
                        display: flex;
                        align-items: center;
                        margin-bottom: 10px;
                    }

                    .form-group label {
                        width: 200px;
                        text-align: right;
                        padding-right: 15px;
                        flex-shrink: 0;
                    }

                    .form-group input {
                        width: 400px;
                        padding: 5px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }

                    .admin-form button {
                        margin-left: 200px;
                        padding: 8px 15px;
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }

                    .admin-form button:hover {
                        background-color: #45a049;
                    }

                    /* 기존 테이블 스타일 유지 */
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
                        padding: 5px 10px;
                    }
                    .delete-btn:hover {
                        background-color: #ffebeb;
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
                        ${rows
                            .map(
                                (row) => `
                            <tr>
                                ${columnNames.map((col) => `<td>${row[col] || ''}</td>`).join('')}
                                <td>
                                    <button onclick="handleDelete('${row.page_name}', '${row.element_key}')" 
                                            class="delete-btn">❌</button>
                                </td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>

            <style>
                /* 기존 스타일 유지 */
                #back {
                    margin: 20px 0;
                    padding: 20px;
                    text-align: center;
                }
                #auth-section {
                    margin: 20px 0;
                    padding: 20px;
                    text-align: center;
                }
                #auth-password {
                    padding: 5px;
                    margin-right: 10px;
                }
            </style>

            <script>
                // 페이지 로드 시 인증 상태 확인
                document.addEventListener('DOMContentLoaded', function() {
                    const isAuthenticated = localStorage.getItem('isAuthenticated');
                    if (isAuthenticated === 'true') {
                        showAdminContent();
                    }
                });

                function authenticate() {
                    const password = document.getElementById('auth-password').value;
                    if (password === 'globalhelper') {
                        localStorage.setItem('isAuthenticated', 'true');
                        showAdminContent();
                    } else {
                        alert('잘못된 암호입니다.');
                    }
                }

                function showAdminContent() {
                    document.getElementById('admin-content').style.display = 'block';
                    document.getElementById('auth-section').style.display = 'none';
                }

                async function handleSubmit(event, type) {
                    event.preventDefault();
                    const form = event.target;
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());
                    
                    try {
                        const response = await fetch(type === 'add' ? '/' : '/update', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data)
                        });
                        
                        if (response.ok) {
                            window.location.reload();
                        } else {
                            const errorData = await response.json();
                            alert(errorData.error || '오류가 발생했습니다.');
                        }
                    } catch (error) {
                        alert('오류가 발생했습니다: ' + error.message);
                    }
                }

                async function handleDelete(pageName, elementKey) {
                    if (!confirm('정말 삭제하시겠습니까?')) return;
                    
                    try {
                        const response = await fetch('/delete', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                page_name: pageName,
                                element_key: elementKey
                            })
                        });
                        
                        if (response.ok) {
                            window.location.reload();
                        } else {
                            const errorData = await response.json();
                            alert(errorData.error || '삭제 중 오류가 발생했습니다.');
                        }
                    } catch (error) {
                        alert('오류가 발생했습니다: ' + error.message);
                    }
                }
            </script>
        `);
    } catch (err) {
        res.status(500).send('데이터베이스 조회 중 오류 발생: ' + err.message);
    }
});

// POST 엔드포인트들 수정 (비밀번호 체크 제거)
app.post('/', async (req, res) => {
    const { page_name, element_key, original_text_ko } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM ui_texts WHERE page_name = ? AND element_key = ?', [
            page_name,
            element_key,
        ]);
        if (rows.length === 0) {
            await pool.query(
                `
                INSERT INTO ui_texts 
                (page_name, element_key, original_text_ko, translated_text_ko) 
                VALUES (?, ?, ?, ?)
            `,
                [page_name, element_key, original_text_ko, original_text_ko]
            );
            res.json({ success: true });
        } else {
            await pool.query(
                `
                UPDATE ui_texts 
                SET original_text_ko = ?, 
                    translated_text_ko = ? 
                WHERE page_name = ? AND element_key = ?
            `,
                [original_text_ko, original_text_ko, page_name, element_key]
            );
            res.json({ success: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/update', async (req, res) => {
    const { page_name, element_key, new_text_ko } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM ui_texts WHERE page_name = ? AND element_key = ?', [
            page_name,
            element_key,
        ]);
        if (rows.length === 0) {
            res.status(404).json({ error: '수정할 UI 텍스트를 찾을 수 없습니다.' });
        } else {
            await pool.query(
                `
                UPDATE ui_texts 
                SET original_text_ko = ?, 
                    translated_text_ko = ? 
                WHERE page_name = ? AND element_key = ?
            `,
                [new_text_ko, new_text_ko, page_name, element_key]
            );
            res.json({ success: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/delete', async (req, res) => {
    const { page_name, element_key } = req.body;
    try {
        await pool.query('DELETE FROM ui_texts WHERE page_name = ? AND element_key = ?', [page_name, element_key]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
