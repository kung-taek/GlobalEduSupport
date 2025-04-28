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

        let rows;
        if (lang === 'ko') {
            // 한국어 요청이면 그냥 original_text_ko만 가져옴
            [rows] = await pool.query(`SELECT element_key, original_text_ko FROM ui_texts WHERE page_name = ?`, [page]);
        } else {
            const langCol = `translated_text_${lang}`;
            await ensureLangColumn(lang); // 혹시 없는 칼럼 생성
            [rows] = await pool.query(
                `SELECT element_key, original_text_ko, ${langCol} FROM ui_texts WHERE page_name = ?`,
                [page]
            );
        }

        const translations = {};

        for (const row of rows) {
            let text;

            if (lang === 'ko') {
                // 한국어는 무조건 원본
                text = row.original_text_ko;
            } else {
                const langCol = `translated_text_${lang}`;
                text = row[langCol];

                if (!text) {
                    // 번역된 게 없으면 번역 시도
                    const translated = await translateText(row.original_text_ko, 'ko', lang);
                    if (translated) {
                        await pool.query(`UPDATE ui_texts SET ${langCol} = ? WHERE page_name = ? AND element_key = ?`, [
                            translated,
                            page,
                            row.element_key,
                        ]);
                        text = translated;
                    } else {
                        console.warn(`⚠️ 번역 실패: ${row.original_text_ko} (${lang})`);
                        text = row.original_text_ko; // fallback
                    }
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
