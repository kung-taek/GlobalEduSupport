import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ ESM 환경에서 __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 정확한 .env 경로로 환경변수 로드
dotenv.config({ path: path.resolve(__dirname, '../../.env') });



// MySQL 연결 설정
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'AWS_DB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

//DB HOST 확인
console.log('DB_HOST:', process.env.DB_HOST);

// 데이터베이스 연결 확인
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL 연결 성공!');
        connection.release();
    } catch (err) {
        console.error('❌ MySQL 연결 실패:', err.message);
    }
})();

export { pool };
