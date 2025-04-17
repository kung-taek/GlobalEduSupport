import axios from 'axios';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getLocationCoordinates = async (req, res) => {
    try {
        const message = req.body.message;

        const gptResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content:
                        '너는 사용자 문장에서 장소나 출발지/도착지를 추출해 JSON으로만 응답하는 함수처럼 행동해. 절대 설명하지 마.',
                },
                {
                    role: 'user',
                    content: `
다음 문장은 실제 길찾기 요청이야. 전학이나 입시 관련 문장이 아님.

예시:
"서울역에서 대전역 가고 싶어" → { "from": "서울역", "to": "대전역" }
"무풍면사무소에 가고 싶어" → { "location": "무풍면사무소" }

입력 문장: "${message}"

📌 반드시 JSON 한 줄로만 응답해. 설명, 줄바꿈, 말투, 인사 모두 금지.
                    `,
                },
            ],
        });

        const parsed = JSON.parse(gptResponse.choices[0].message.content);
        const headers = { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` };

        if (parsed.location) {
            const locRes = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
                params: { query: parsed.location },
                headers,
            });
            const loc = locRes.data.documents[0];
            return res.json({ type: 'location', lat: loc.y, lng: loc.x });
        }

        if (parsed.from && parsed.to) {
            const [fromRes, toRes] = await Promise.all([
                axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
                    params: { query: parsed.from },
                    headers,
                }),
                axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
                    params: { query: parsed.to },
                    headers,
                }),
            ]);
            const from = fromRes.data.documents[0];
            const to = toRes.data.documents[0];
            return res.json({
                type: 'route',
                from: { lat: from.y, lng: from.x },
                to: { lat: to.y, lng: to.x },
            });
        }

        return res.status(400).json({ error: '좌표를 추출할 수 없습니다.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: '서버 오류' });
    }
};
