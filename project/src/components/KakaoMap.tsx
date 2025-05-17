import React, { useEffect } from 'react';
import styled from 'styled-components';

declare global {
    interface Window {
        kakao: any;
    }
}

interface KakaoMapProps {
    path?: number[];
    address?: { lat: number; lng: number; name?: string };
    mapId?: string;
}

const MapContainer = styled.div`
    width: 100%;
    height: 100%;
`;

const LoadingContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    font-size: 16px;
    color: #495057;
`;

const KakaoMap: React.FC<KakaoMapProps> = ({ path, address, mapId = 'map' }) => {
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

            if (address && address.lat && address.lng) {
                const coords = new window.kakao.maps.LatLng(address.lat, address.lng);
                map.setCenter(coords);
                new window.kakao.maps.Marker({
                    map: map,
                    position: coords,
                    title: address.name || '검색 위치',
                });
            }

            if (path && path.length > 0) {
                const linePath = [];

                for (let i = 0; i < path.length; i += 2) {
                    const lng = path[i];
                    const lat = path[i + 1];
                    linePath.push(new window.kakao.maps.LatLng(lat, lng));
                }

                new window.kakao.maps.Polyline({
                    map: map,
                    path: linePath,
                    strokeWeight: 5,
                    strokeColor: '#007aff',
                    strokeOpacity: 0.9,
                    strokeStyle: 'solid',
                });

                new window.kakao.maps.Marker({
                    map,
                    position: linePath[0],
                    title: '출발지',
                });

                new window.kakao.maps.Marker({
                    map,
                    position: linePath[linePath.length - 1],
                    title: '도착지',
                });

                map.setCenter(linePath[0]);
            }
        };

        loadKakaoMap();
    }, [path, address, mapId]);

    return <div id={mapId} style={{ width: '100%', height: '100%', borderRadius: '12px' }}></div>;
};

export default KakaoMap;
