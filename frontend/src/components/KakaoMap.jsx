import { useEffect } from 'react';

//경로로
const KakaoMap = ({ path, mapId = 'map' }) => {
    useEffect(() => {
        const loadKakaoMap = () => {
            if (window.kakao && window.kakao.maps) {
                initMap();
            } else {
                const script = document.createElement('script');
                script.src =
                    'https://dapi.kakao.com/v2/maps/sdk.js?appkey=dc81fb0ef560ec0b20d8bbd87ebbf591&autoload=false&libraries=services';
                script.onload = () => {
                    window.kakao.maps.load(() => initMap());
                };
                document.head.appendChild(script);
            }
        };

        const initMap = () => {
            const container = document.getElementById(mapId);
            const map = new window.kakao.maps.Map(container, {
                center: new window.kakao.maps.LatLng(35.9, 128.8),
                level: 5,
            });

            if (path && path.length > 0) {
                const linePath = [];

                for (let i = 0; i < path.length; i += 2) {
                    const lng = path[i];
                    const lat = path[i + 1];
                    linePath.push(new window.kakao.maps.LatLng(lat, lng));
                }

                // Polyline 생성
                new window.kakao.maps.Polyline({
                    map: map,
                    path: linePath,
                    strokeWeight: 5,
                    strokeColor: '#007aff',
                    strokeOpacity: 0.9,
                    strokeStyle: 'solid',
                });

                // 시작점에 마커
                new window.kakao.maps.Marker({
                    map,
                    position: linePath[0],
                    title: '출발지',
                });

                // 도착점에 마커
                new window.kakao.maps.Marker({
                    map,
                    position: linePath[linePath.length - 1],
                    title: '도착지',
                });

                map.setCenter(linePath[0]);
            }
        };

        loadKakaoMap();
    }, [path, mapId]);

    // Kakao API 키 출력
    console.log('Kakao API Key (Frontend):', 'dc81fb0ef560ec0b20d8bbd87ebbf591');

    return <div id={mapId} style={{ width: '100%', height: '500px', borderRadius: '12px', marginTop: '20px' }}></div>;
};

export default KakaoMap;
