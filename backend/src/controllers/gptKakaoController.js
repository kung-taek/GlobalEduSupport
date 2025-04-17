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
                    role: 'system',
                    content:
                        '너는 사용자의 문장에서 장소 또는 출발지/도착지를 추출해 JSON으로만 응답하는 함수처럼 행동해. 절대 설명하지 마.',
                },
                {
                    role: 'user',
                    content: `
다음 문장은 실제 길찾기 요청입니다. 전학이 아닌 이동 경로이며, 출발지/도착지를 추출해 JSON으로만 응답하세요.

예시1: "무풍면사무소에 가고 싶어" → { "location": "무풍면사무소" }
예시2: "서울역에서 대전역으로 가고 싶어" → { "from": "서울역", "to": "대전역" }

문장: "${message}"

JSON 외 텍스트 금지. 한 줄로만 응답해 주세요.
            `,
                },
            ],
        });

        let parsed;
        try {
            parsed = JSON.parse(gptResponse.data.choices[0].message.content);
        } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            return res.status(500).json({ error: 'JSON 파싱 실패' });
        }

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
