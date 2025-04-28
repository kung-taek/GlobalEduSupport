import express from 'express';
import { pool } from '../models/database.js';
import { translateText } from '../utils/translate.js';
import { ensureLangColumn } from '../utils/dbUtils.js';
import cors from 'cors';

const router = express.Router();

const allowedOrigins = [
    'http://globalhelper.p-e.kr',
    'http://globalhelper.p-e.kr:5000',
    'https://globalhelper.p-e.kr',
    'http://localhost:5173',
    'http://localhost:3000',
];

router.get('/', async (req, res) => {
    try {
        const { lang = 'ko', page } = req.query;
        if (!page) return res.status(400).json({ error: 'page 쿼리 필요' });

        const langCol = lang === 'ko' ? 'original_text_ko' : `translated_text_${lang}`;
        if (lang !== 'ko') {
            await ensureLangColumn(lang);
        }

        // 해당 페이지의 모든 텍스트 조회
        const [rows] = await pool.query(
            `SELECT element_key, original_text_ko, ${langCol} FROM ui_texts WHERE page_name = ?`,
            [page]
        );

        // 번역이 없는 경우 번역 시도 및 DB 업데이트
        const translations = {};
        for (const row of rows) {
            let text = row[langCol];
            if (!text && lang !== 'ko') {
                // 번역 시도
                const translated = await translateText(row.original_text_ko, 'ko', lang);
                if (translated) {
                    await pool.query(`UPDATE ui_texts SET ${langCol} = ? WHERE page_name = ? AND element_key = ?`, [
                        translated,
                        page,
                        row.element_key,
                    ]);
                    text = translated;
                } else {
                    text = row.original_text_ko; // fallback
                }
            }
            translations[row.element_key] = text || row.original_text_ko;
        }
        res.json(translations);
    } catch (err) {
        console.error('UI 텍스트 API 오류:', err);
        res.status(500).json({ error: err.message || '서버 오류' });
    }
});

export default router;
