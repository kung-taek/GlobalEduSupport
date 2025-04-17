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
                        '너는 사용자 문장에서 장소나 출발지/도착지를 추출해서 JSON 한 줄로만 응답하는 파싱 함수처럼 행동해. 절대 설명하지 마. 인사도 하지 마. 줄바꿈도 하지 마.',
                },
                {
                    role: 'user',
                    content: `
아래 문장은 실제 지도 검색용 길찾기 요청이야.

예시:
- "서울역에서 대전역 가고 싶어" → { "from": "서울역", "to": "대전역" }
- "무풍면사무소에 가고 싶어" → { "location": "무풍면사무소" }
- "무주읍, 무풍면" → { "from": "무주읍", "to": "무풍면" }

문장: "${message}"
JSON 한 줄만 응답해. 텍스트 설명, 인사, 줄바꿈 절대 금지.
                    `,
                },
            ],
        });

        let parsed;
        try {
            parsed = JSON.parse(gptResponse.choices[0].message.content);
        } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            return res.status(400).json({ error: '좌표를 찾을 수 없습니다.' });
        }

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
