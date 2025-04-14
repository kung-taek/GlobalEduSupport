// src/models/database.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL 연결 설정
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'globalHelperDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});


console.log("DB_HOST:", process.env.DB_HOST);





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

export default pool;
