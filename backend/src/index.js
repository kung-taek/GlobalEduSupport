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
import postRouter from './routes/post.js';

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

// Passport 초기화
app.use(passport.initialize());

// 라우터 등록
app.use('/api/gpt', gptRouter);
app.use('/api/kakao', kakaoRouter);
app.use('/api/auth', authRouter);
app.use('/api/gpt-kakao', gptKakaoRouter);
app.use('/api/ui-texts', uiTextsRouter);
app.use('/api/posts', postRouter);

// 문자열을 안전하게 이스케이프하는 함수 추가
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeJs(str) {
    if (str === null || str === undefined) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

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

        // 데이터를 JSON 문자열로 안전하게 변환 ㄹㄹ
        const safeRowsJson = JSON.stringify(rows).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

        res.send(`
            <div id="auth-section">
                <h3>✅ 백엔드 서버 정상 가동!</h3>
                <input type="password" id="auth-password" placeholder="관리자 암호를 입력하세요">
                <button onclick="authenticate()">확인</button>
            </div>

            <div id="admin-content" style="display: none;">
                <h2>원문 등록</h2>
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

                <div style="display: flex; align-items: center;">
                    <h2 style="margin: 0;">데이터베이스 현재 상태</h2>
                    <div>
                        <input id="searchPageName" type="text" placeholder="page_name 검색" style="padding: 6px; border-radius: 4px; border: 1px solid #ccc;">
                        <button onclick="filterByPageName()" style="padding: 6px 12px; margin-left: 4px;">검색</button>
                        <button onclick="resetFilter()" style="padding: 6px 12px; margin-left: 4px;">초기화</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            ${tableHeaders}
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                    </tbody>
                </table>

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
                    .editable-cell {
                        min-height: 20px;
                        padding: 5px;
                        cursor: pointer;
                        position: relative;
                    }
                    .editable-cell:hover {
                        background-color: #f0f0f0;
                    }
                    .editable-cell.editing {
                        padding: 0;
                    }
                    .edit-input {
                        width: 100%;
                        padding: 5px;
                        box-sizing: border-box;
                        border: 2px solid #4CAF50;
                        border-radius: 4px;
                    }
                    .edit-controls {
                        position: absolute;
                        right: 0;
                        top: 100%;
                        background: white;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        padding: 5px;
                        z-index: 100;
                        display: flex;
                        gap: 5px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    }
                    .edit-controls button {
                        padding: 3px 8px;
                        cursor: pointer;
                        border: none;
                        border-radius: 3px;
                    }
                    .save-btn {
                        background-color: #4CAF50;
                        color: white;
                    }
                    .save-btn:hover {
                        background-color: #45a049;
                    }
                    .cancel-btn {
                        background-color: #f44336;
                        color: white;
                    }
                    .cancel-btn:hover {
                        background-color: #da190b;
                    }
                    .delete-btn {
                        background: none;
                        border: none;
                        color: red;
                        cursor: pointer;
                    }
                    .delete-btn:hover {
                        background-color: #ffebeb;
                    }
                    .admin-form {
                        margin: 20px 0;
                    }
                    .form-group {
                        margin-bottom: 10px;
                    }
                    .form-group label {
                        display: inline-block;
                        width: 200px;
                    }
                    .form-group input {
                        width: 300px;
                        padding: 5px;
                    }
                </style>

                <script>
                    const tableData = ${safeRowsJson};
                    const columnNames = ${JSON.stringify(columnNames)};

                    function renderTable(data = tableData) {
                        const tbody = document.getElementById('tableBody');
                        tbody.innerHTML = data.map(row => {
                            const cells = columnNames.map(col => {
                                if (col === 'id') {
                                    return \`<td>\${row[col] || ''}</td>\`;
                                }
                                const safeValue = (row[col] || '').replace(/"/g, '&quot;');
                                return \`
                                    <td>
                                        <div class="editable-cell"
                                             onclick="makeEditable(this)"
                                             data-page-name="\${row.page_name.replace(/"/g, '&quot;')}"
                                             data-element-key="\${row.element_key.replace(/"/g, '&quot;')}"
                                             data-column="\${col}"
                                             data-original="\${safeValue}">\${safeValue}</div>
                                    </td>
                                \`;
                            }).join('');

                            return \`
                                <tr>
                                    \${cells}
                                    <td>
                                        <button onclick="handleDelete('\${row.page_name.replace(/'/g, '\\\'')}', '\${row.element_key.replace(/'/g, '\\\'')}')" 
                                                class="delete-btn">❌</button>
                                    </td>
                                </tr>
                            \`;
                        }).join('');
                    }

                    renderTable();

                    function makeEditable(element) {
                        // 이미 편집 중인 다른 셀이 있다면 원래 상태로 복원
                        const existingEditing = document.querySelector('.editable-cell.editing');
                        if (existingEditing && existingEditing !== element) {
                            const originalText = existingEditing.getAttribute('data-original');
                            existingEditing.classList.remove('editing');
                            existingEditing.innerHTML = originalText;
                        }
                        
                        if (element.classList.contains('editing')) return;
                        
                        const originalText = element.getAttribute('data-original');
                        element.classList.add('editing');
                        
                        const input = document.createElement('input');
                        input.value = originalText;
                        input.className = 'edit-input';
                        
                        const controls = document.createElement('div');
                        controls.className = 'edit-controls';
                        controls.innerHTML = \`
                            <button class="save-btn" onclick="saveEdit(this)">저장</button>
                            <button class="cancel-btn" onclick="cancelEdit(this)">취소</button>
                        \`;
                        
                        element.innerHTML = '';
                        element.appendChild(input);
                        element.appendChild(controls);
                        input.focus();

                        input.addEventListener('keydown', function(e) {
                            if (e.key === 'Enter') {
                                saveEdit(controls.querySelector('.save-btn'));
                            } else if (e.key === 'Escape') {
                                cancelEdit(controls.querySelector('.cancel-btn'));
                            }
                        });
                    }

                    async function saveEdit(button) {
                        const cell = button.closest('.editable-cell');
                        const input = cell.querySelector('input');
                        const newText = input.value;
                        const pageName = cell.getAttribute('data-page-name');
                        const elementKey = cell.getAttribute('data-element-key');
                        const column = cell.getAttribute('data-column');
                        
                        try {
                            const response = await fetch('/update-column', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    page_name: pageName,
                                    element_key: elementKey,
                                    column: column,
                                    value: newText
                                })
                            });
                            
                            if (response.ok) {
                                window.location.reload();
                            } else {
                                const errorData = await response.json();
                                alert(errorData.error || '수정 중 오류가 발생했습니다.');
                                // 저장 실패 시 원래 텍스트로 복원
                                const originalText = cell.getAttribute('data-original');
                                cell.classList.remove('editing');
                                cell.innerHTML = originalText;
                            }
                        } catch (error) {
                            alert('오류가 발생했습니다: ' + error.message);
                            // 에러 발생 시 원래 텍스트로 복원
                            const originalText = cell.getAttribute('data-original');
                            cell.classList.remove('editing');
                            cell.innerHTML = originalText;
                        }
                    }

                    async function cancelEdit(button) {
                        const cell = button.closest('.editable-cell');
                        const input = cell.querySelector('input');
                        const newText = cell.getAttribute('data-original'); // 원래 텍스트 가져오기
                        const pageName = cell.getAttribute('data-page-name');
                        const elementKey = cell.getAttribute('data-element-key');
                        const column = cell.getAttribute('data-column');

                        try {
                            const response = await fetch('/update-column', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    page_name: pageName,
                                    element_key: elementKey,
                                    column: column,
                                    value: newText
                                })
                            });
                            
                            if (response.ok) {
                                // 성공적으로 저장되면 셀을 원래 상태로 복원
                                cell.classList.remove('editing');
                                cell.innerHTML = newText;
                                window.location.reload();
                            } else {
                                const errorData = await response.json();
                                alert(errorData.error || '수정 중 오류가 발생했습니다.');
                                cell.classList.remove('editing');
                                cell.innerHTML = newText;
                            }
                        } catch (error) {
                            alert('오류가 발생했습니다: ' + error.message);
                            cell.classList.remove('editing');
                            cell.innerHTML = newText;
                        }
                    }

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
                            const response = await fetch('/', {
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

                    function filterByPageName() {
                        const searchValue = document.getElementById('searchPageName').value.trim();
                        if (!searchValue) {
                            renderTable();
                            return;
                        }
                        const filtered = tableData.filter(row => row.page_name && row.page_name.includes(searchValue));
                        renderTable(filtered);
                    }

                    function resetFilter() {
                        document.getElementById('searchPageName').value = '';
                        renderTable();
                    }
                </script>
            </div>
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

// 새로운 엔드포인트 추가
app.post('/update-column', async (req, res) => {
    const { page_name, element_key, column, value } = req.body;
    try {
        // 데이터베이스에서 컬럼 정보를 동적으로 가져옴
        const [columns] = await pool.query(
            `SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'ui_texts' 
            AND TABLE_SCHEMA = ?`,
            [process.env.DB_NAME || 'AWS_DB']
        );

        // id를 제외한 모든 컬럼을 허용
        const allowedColumns = columns.map((col) => col.COLUMN_NAME).filter((colName) => colName !== 'id');

        if (!allowedColumns.includes(column)) {
            return res.status(400).json({ error: '유효하지 않은 컬럼입니다.' });
        }

        await pool.query(`UPDATE ui_texts SET ${column} = ? WHERE page_name = ? AND element_key = ?`, [
            value,
            page_name,
            element_key,
        ]);
        res.json({ success: true });
    } catch (err) {
        console.error('컬럼 업데이트 오류:', err);
        res.status(500).json({ error: err.message });
    }
});

// 새로운 엔드포인트 추가
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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
