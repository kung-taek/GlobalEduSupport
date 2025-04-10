import { OpenAI } from 'openai';

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
