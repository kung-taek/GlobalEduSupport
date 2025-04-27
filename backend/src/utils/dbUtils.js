import { pool } from '../models/database.js';

export async function ensureLangColumn(langCode) {
    const column = `translated_text_${langCode}`;
    // 컬럼 존재 여부 확인
    const [columns] = await pool.query(`SHOW COLUMNS FROM ui_texts LIKE ?`, [column]);
    if (columns.length === 0) {
        // 컬럼이 없으면 추가
        await pool.query(`ALTER TABLE ui_texts ADD COLUMN ${column} TEXT`);
    }
    return column;
}
