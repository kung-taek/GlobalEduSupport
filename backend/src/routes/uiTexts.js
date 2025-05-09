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

        const [rows] = await pool.query(
            `SELECT page_name, element_key, original_text_ko, ${langCol} FROM ui_texts WHERE page_name = ?`,
            [page]
        );

        const processedRows = await Promise.all(
            rows.map(async (row) => {
                let translatedText = row[langCol];
                if (!translatedText && lang !== 'ko') {
                    const translated = await translateText(row.original_text_ko, 'ko', lang);
                    if (translated) {
                        await pool.query(`UPDATE ui_texts SET ${langCol} = ? WHERE page_name = ? AND element_key = ?`, [
                            translated,
                            page,
                            row.element_key,
                        ]);
                        translatedText = translated;
                    } else {
                        translatedText = row.original_text_ko;
                    }
                } else if (!translatedText && lang === 'ko') {
                    translatedText = row.original_text_ko;
                }

                return {
                    ...row,
                    [langCol]: translatedText,
                };
            })
        );

        res.json(processedRows);
    } catch (err) {
        console.error('UI 텍스트 API 오류:', err);
        res.status(500).json({ error: err.message || '서버 오류' });
    }
});

// 번역 테스트용 엔드포인트 추가
router.post('/translate-test', async (req, res) => {
    try {
        const { text, from = 'ko', to = 'en' } = req.body;

        if (!text) {
            return res.status(400).json({ error: '번역할 텍스트를 입력해주세요.' });
        }

        const translated = await translateText(text, from, to);

        if (translated === null) {
            return res.status(500).json({
                error: '번역 실패',
                details: '번역 API 호출 중 오류가 발생했습니다.',
            });
        }

        res.json({
            original: text,
            translated,
            from,
            to,
        });
    } catch (err) {
        console.error('번역 테스트 오류:', err);
        res.status(500).json({
            error: '서버 오류',
            message: err.message,
        });
    }
});

router.post('/translate-all', async (req, res) => {
    const targetLangs = ['en', 'ja', 'vi', 'mn', 'zh', 'ru', 'fr', 'es', 'ar'];
    try {
        const [rows] = await pool.query('SELECT * FROM ui_texts');
        for (const row of rows) {
            for (const lang of targetLangs) {
                const col = `translated_text_${lang}`;
                await ensureLangColumn(lang);
                if (!row[col]) {
                    const translated = await translateText(row.original_text_ko, 'ko', lang);
                    if (translated) {
                        await pool.query(`UPDATE ui_texts SET ${col} = ? WHERE id = ?`, [translated, row.id]);
                    }
                }
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
