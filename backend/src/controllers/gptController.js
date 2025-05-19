import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { pool } from '../models/database.js';

dotenv.config();

export const handleGPTMessage = async (req, res) => {
    const { messages, message } = req.body;
    let userLocale = 'ko';
    try {
        // JWT 인증 미들웨어가 req.user를 세팅했다고 가정
        if (req.user && req.user.email) {
            const [users] = await pool.query('SELECT locale FROM users WHERE email = ?', [req.user.email]);
            if (users.length > 0 && users[0].locale) {
                userLocale = users[0].locale;
            }
        }
    } catch (e) {
        // locale 조회 실패 시 무시하고 기본값 사용
    }

    // messages 배열이 있으면 ChatGPT 방식으로 처리
    if (messages && Array.isArray(messages)) {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        try {
            // 언어 안내문 더 명확하게
            let systemPrompt = '';
            if (userLocale === 'ko') {
                systemPrompt = '내가 어떤 언어로 질문하더라도 반드시 한국어로만 답변해.';
            } else if (userLocale === 'en') {
                systemPrompt = 'No matter what language I ask in, always answer ONLY in English.';
            } else {
                systemPrompt = `No matter what language I ask in, always answer ONLY in ${userLocale}.`;
            }
            const newMessages = [{ role: 'system', content: systemPrompt }, ...messages];
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: newMessages,
            });
            const reply = completion.choices[0].message.content;
            return res.json({ reply });
        } catch (error) {
            console.error('GPT API 오류:', error);
            return res.status(500).json({ error: 'GPT 응답 중 에러 발생' });
        }
    }

    // message 단일 문자열이 있으면 기존 방식으로 처리
    if (typeof message === 'string') {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        try {
            // 언어 안내문 더 명확하게
            let systemPrompt = '';
            if (userLocale === 'ko') {
                systemPrompt = '내가 어떤 언어로 질문하더라도 반드시 한국어로만 답변해.';
            } else if (userLocale === 'en') {
                systemPrompt = 'No matter what language I ask in, always answer ONLY in English.';
            } else {
                systemPrompt = `No matter what language I ask in, always answer ONLY in ${userLocale}.`;
            }
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message },
                ],
            });
            const reply = completion.choices[0].message.content;
            return res.json({ reply });
        } catch (error) {
            console.error('GPT API 오류:', error);
            return res.status(500).json({ error: 'GPT 응답 중 에러 발생' });
        }
    }

    // 둘 다 없으면 에러
    return res.status(400).json({ error: 'messages 배열 또는 message 문자열이 필요합니다.' });
};

// GPT를 사용하여 장소나 출발지/도착지를 추출하는 함수
export const extractLocationFromGPT = async (req, res) => {
    const { message } = req.body;
    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }],
        });

        // GPT 응답에서 장소명 추출
        const reply = response.data.choices[0].message.content;
        res.json({ location: reply });
    } catch (error) {
        console.error('GPT 처리 중 오류 발생:', error);
        res.status(500).json({ error: 'GPT 처리 실패' });
    }
};
