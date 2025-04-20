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
                    content: `너는 텍스트에서 장소 정보만 추출하는 파서야.
입력된 텍스트에 장소나 위치가 언급되면 반드시 JSON 형식으로 추출해야 해.
장소 이름만 깔끔하게 추출하고, 다른 정보는 모두 무시해.
설명, 주소 등은 제외하고 핵심 장소 이름만 추출해.`,
                },
                {
                    role: 'user',
                    content: `다음은 입력과 출력의 예시야:

입력: "서울대학교 위치 알려줘"
출력: {"location":"서울대학교"}

입력: "서울대학교는 서울특별시 관악구 관악로 1에 있어"
출력: {"location":"서울대학교"}

입력: "강남역에서 역삼역까지 가는 길 알려줘"
출력: {"from":"강남역","to":"역삼역"}

입력: "서울역에서 부산역까지 어떻게 가?"
출력: {"from":"서울역","to":"부산역"}

지금부터 이 입력을 분석해줘. 반드시 위와 같은 JSON 형식으로만 답변해:
"${message}"`,
                },
            ],
        });

        let parsed;
        try {
            const content = gptResponse.choices[0].message.content.trim();
            console.log('GPT Response:', content);
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
                return res.json({
                    type: 'route',
                    from: { lat: from.y, lng: from.x, place_name: from.place_name },
                    to: { lat: to.y, lng: to.x, place_name: to.place_name },
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
