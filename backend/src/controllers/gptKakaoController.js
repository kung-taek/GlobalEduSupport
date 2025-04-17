import axios from 'axios';
import OpenAI from 'openai';

// OpenAI 인스턴스 생성
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getLocationCoordinates = async (req, res) => {
    try {
        const message = req.body.message;

        const gptResponse = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: `
다음 문장에서 장소 또는 출발지/도착지를 추출해서 JSON 형식으로 응답해줘.

예시1: "무풍면사무소에 가고 싶어" → { "location": "무풍면사무소" }
예시2: "서울역에서 대전역으로 가고 싶어" → { "from": "서울역", "to": "대전역" }

절대 설명 없이 JSON 객체만 응답해.
문장: "${message}"
            `,
                },
            ],
        });

        const parsed = JSON.parse(gptResponse.data.choices[0].message.content);

        const headers = { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` };

        if (parsed.location) {
            const locRes = await axios.get(`https://dapi.kakao.com/v2/local/search/keyword.json`, {
                params: { query: parsed.location },
                headers,
            });
            const result = locRes.data.documents[0];
            return res.json({ lat: result.y, lng: result.x, type: 'location' });
        }

        if (parsed.from && parsed.to) {
            const [fromRes, toRes] = await Promise.all([
                axios.get(`https://dapi.kakao.com/v2/local/search/keyword.json`, {
                    params: { query: parsed.from },
                    headers,
                }),
                axios.get(`https://dapi.kakao.com/v2/local/search/keyword.json`, {
                    params: { query: parsed.to },
                    headers,
                }),
            ]);

            return res.json({
                type: 'route',
                from: { lat: fromRes.data.documents[0].y, lng: fromRes.data.documents[0].x },
                to: { lat: toRes.data.documents[0].y, lng: toRes.data.documents[0].x },
            });
        }

        return res.status(400).json({ error: '장소를 추출하지 못했습니다.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: '서버 에러' });
    }
};
