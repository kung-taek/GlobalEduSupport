import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

export const handleGPTMessage = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: '메시지가 비어 있어요.' });
    }

    // ✅ 여기서 OpenAI 인스턴스를 생성 (env가 로드된 후)
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }],
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error('GPT API 오류:', error);
        res.status(500).json({ error: 'GPT 응답 중 에러 발생' });
    }
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
