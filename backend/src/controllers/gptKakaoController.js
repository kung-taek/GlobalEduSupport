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
                        '너는 사용자의 메시지에서 장소나 경로 정보를 추출하는 파서야. 장소가 언급되면 무조건 JSON으로 변환해야 해. 설명이나 다른 정보는 무시하고 장소만 추출해.',
                },
                {
                    role: 'user',
                    content: `
다음과 같은 형식으로 장소/경로 정보를 JSON으로 변환해줘:

입력: "서울역에서 대전역 가고 싶어"
출력: { "from": "서울역", "to": "대전역" }

입력: "서울대학교 위치 알려줘"
출력: { "location": "서울대학교" }

입력: "서울대학교는 어디에 있어?"
출력: { "location": "서울대학교" }

입력: "서울대학교는 대한민국 서울특별시 관악구에 위치해 있습니다."
출력: { "location": "서울대학교" }

입력: "${message}"
JSON으로만 응답해. 설명하지 마.`,
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
