import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Kakao API 키 출력
console.log('Kakao API Key (Backend):', process.env.KAKAO_REST_API_KEY);

exports.getRouteInfo = async (req, res) => {
    const { from, to } = req.body;

    try {
        // 1. 주소 → 좌표 변환
        const geocode = async (query) => {
            const url = `https://dapi.kakao.com/v2/local/search/address.json`;
            const response = await axios.get(url, {
                params: { query },
                headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` },
            });

            if (response.data.documents.length === 0) throw new Error('주소 없음');
            const { x, y } = response.data.documents[0];
            return { x, y };
        };

        const fromCoord = await geocode(from);
        const toCoord = await geocode(to);

        // 2. 좌표 → 경로 탐색
        const routeRes = await axios.get(`https://apis-navi.kakaomobility.com/v1/directions`, {
            params: {
                origin: `${fromCoord.x},${fromCoord.y}`,
                destination: `${toCoord.x},${toCoord.y}`,
            },
            headers: {
                Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
            },
        });

        const result = routeRes.data.routes[0];
        res.json({
            distance: result.summary.distance,
            duration: result.summary.duration,
            path: result.sections[0].roads.flatMap((r) => r.vertexes),
        });
    } catch (err) {
        console.error(err); // ← 이거 있어야 어디서 에러났는지 확인 가능
        res.status(500).json({ error: '경로 계산 실패' });
    }
};

// Kakao 장소 검색 API를 사용하여 키워드로 위치를 검색하는 함수
exports.searchKeyword = async (req, res) => {
    const { keyword } = req.body;
    try {
        const response = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
            params: { query: keyword },
            headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` },
        });

        if (response.data.documents.length === 0) {
            return res.status(404).json({ error: '장소를 찾을 수 없습니다.' });
        }

        const location = response.data.documents[0];
        res.json({ location });
    } catch (error) {
        console.error('Kakao API 요청 중 오류 발생:', error);
        res.status(500).json({ error: 'Kakao API 요청 실패' });
    }
};
