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
    'http://localhost:5173', // Vite 기본 포트
    'http://localhost:3000',
    'http://127.0.0.1:5173', // Vite 대체 포트
    'http://127.0.0.1:3000',
];

router.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.log('Blocked by CORS:', origin);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);

router.get('/', async (req, res) => {
    try {
        const { lang = 'ko', page } = req.query;
        if (!page) return res.status(400).json({ error: 'page 쿼리 필요' });

        const langCol = `translated_text_${lang}`;
        if (lang !== 'ko') {
            await ensureLangColumn(lang);
        }

        // 요청된 page_name의 데이터만 가져오기
        const [rows] = await pool.query(
            `SELECT page_name, element_key, original_text_ko, ${langCol} FROM ui_texts WHERE page_name = ?`,
            [page]
        );

        console.log(`Fetching translations for page: ${page}, lang: ${lang}`); // 디버깅용 로그
        console.log('Initial rows:', rows); // 디버깅용 로그

        const translations = [];

        for (const row of rows) {
            let text = row[langCol];

            if (!text && lang !== 'ko') {
                console.log(`Translating text for ${row.element_key}`); // 디버깅용 로그
                const translated = await translateText(row.original_text_ko, 'ko', lang);
                if (translated) {
                    await pool.query(`UPDATE ui_texts SET ${langCol} = ? WHERE page_name = ? AND element_key = ?`, [
                        translated,
                        page,
                        row.element_key,
                    ]);
                    text = translated;
                    console.log(`Translated ${row.element_key}:`, translated); // 디버깅용 로그
                } else {
                    text = row.original_text_ko;
                    console.log(`Translation failed for ${row.element_key}, using original`); // 디버깅용 로그
                }
            } else if (!text && lang === 'ko') {
                text = row.original_text_ko;
            }

            translations.push({
                page_name: page,
                element_key: row.element_key,
                original_text_ko: row.original_text_ko,
                [langCol]: text,
            });
        }

        console.log('Final translations:', translations); // 디버깅용 로그
        res.json(translations);
    } catch (err) {
        console.error('UI 텍스트 API 오류:', err);
        res.status(500).json({ error: err.message || '서버 오류' });
    }
});

router.post('/translate-all', async (req, res) => {
    const { lang } = req.body;
    if (!lang) return res.status(400).json({ error: 'lang 파라미터 필요' });
    const langCol = `translated_text_${lang}`;
    await ensureLangColumn(lang);
    const [rows] = await pool.query('SELECT * FROM ui_texts');
    for (const row of rows) {
        if (!row[langCol]) {
            const translated = await translateText(row.original_text_ko, 'ko', lang);
            if (translated) {
                await pool.query(`UPDATE ui_texts SET ${langCol} = ? WHERE id = ?`, [translated, row.id]);
            }
        }
    }
    res.json({ success: true });
});

router.get('/all', async (req, res) => {
    try {
        const { lang = 'ko' } = req.query;
        const langCol = `translated_text_${lang}`;
        if (lang !== 'ko') {
            await ensureLangColumn(lang);
        }
        const [rows] = await pool.query(`SELECT page_name, element_key, original_text_ko, ${langCol} FROM ui_texts`);
        // page_name별로 묶어서 반환
        const result = {};
        for (const row of rows) {
            if (!result[row.page_name]) result[row.page_name] = {};
            result[row.page_name][row.element_key] = row[langCol] || row.original_text_ko;
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
