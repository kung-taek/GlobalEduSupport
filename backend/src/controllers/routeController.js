import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const getRouteInfo = async (req, res) => {
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
