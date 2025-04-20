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
            temperature: 0,
            messages: [
                {
                    role: 'system',
                    content: `너는 사용자의 메시지에서 장소나 경로 정보를 추출하는 파서야. 
다음 규칙을 반드시 따라야 해:
1. "A에서 B로 가고 싶어", "A에서 B까지 가는 길" 같은 경로 요청은 반드시 {"from":"A", "to":"B"} 형식으로 응답
2. 단일 장소 질문은 {"location":"장소명"} 형식으로 응답
3. 설명이나 다른 정보는 무시하고 장소 정보만 추출`,
                },
                {
                    role: 'user',
                    content: `다음과 같은 형식으로 장소/경로 정보를 JSON으로 변환해줘:

입력: "하양읍에서 동대구역까지 가고 싶어"
출력: {"from":"하양읍","to":"동대구역"}

입력: "서울대학교 위치 알려줘"
출력: {"location":"서울대학교"}

입력: "하양에서 동대구로 가는 길 알려줘"
출력: {"from":"하양","to":"동대구"}

입력: "${message}"
JSON으로만 응답해. 설명하지 마.`,
                },
            ],
        });

        let parsed;
        try {
            const content = gptResponse.choices[0].message.content.trim();
            console.log('GPT 응답:', content); // 디버깅용 로그
            parsed = JSON.parse(content);
        } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            console.error('GPT 원본 응답:', gptResponse.choices[0].message.content);
            return res.status(400).json({ error: '위치 정보를 추출할 수 없습니다.' });
        }

        const headers = { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` };

        if (parsed.location) {
            try {
                const locRes = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
                    params: { query: parsed.location },
                    headers,
                });

                if (!locRes.data.documents || locRes.data.documents.length === 0) {
                    return res.status(400).json({ error: '해당 위치를 찾을 수 없습니다.' });
                }

                const loc = locRes.data.documents[0];
                return res.json({
                    type: 'location',
                    lat: loc.y,
                    lng: loc.x,
                    place_name: loc.place_name,
                });
            } catch (error) {
                console.error('카카오 API 오류:', error);
                return res.status(500).json({ error: '위치 검색 중 오류가 발생했습니다.' });
            }
        }

        if (parsed.from && parsed.to) {
            try {
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

                if (!fromRes.data.documents[0] || !toRes.data.documents[0]) {
                    return res.status(400).json({ error: '출발지 또는 도착지를 찾을 수 없습니다.' });
                }

                const from = fromRes.data.documents[0];
                const to = toRes.data.documents[0];

                // 경로 API 호출 추가
                const routeRes = await axios.get('https://apis-navi.kakaomobility.com/v1/directions', {
                    params: {
                        origin: `${from.x},${from.y}`,
                        destination: `${to.x},${to.y}`,
                    },
                    headers,
                });

                // 경로 정보 포함하여 응답
                return res.json({
                    type: 'route',
                    from: { lat: from.y, lng: from.x, place_name: from.place_name },
                    to: { lat: to.y, lng: to.x, place_name: to.place_name },
                    path: routeRes.data.routes[0].sections[0].roads.flatMap((r) => r.vertexes),
                });
            } catch (error) {
                console.error('카카오 API 오류:', error);
                return res.status(500).json({ error: '경로 검색 중 오류가 발생했습니다.' });
            }
        }

        return res.status(400).json({ error: '위치 정보를 추출할 수 없습니다.' });
    } catch (error) {
        console.error('서버 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
};
