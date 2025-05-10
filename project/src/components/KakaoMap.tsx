import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

declare global {
  interface Window { kakao: any; }
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

const KakaoMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 카카오맵 스크립트가 로드됐는지 확인
    const checkKakao = setInterval(() => {
      if (window.kakao && window.kakao.maps) {
        setIsLoaded(true);
        clearInterval(checkKakao);
      }
    }, 100);

    // 30초 후에도 로드되지 않으면 에러 처리
    const timeout = setTimeout(() => {
      if (!window.kakao || !window.kakao.maps) {
        setError('카카오맵을 불러오는 데 실패했습니다. 페이지를 새로고침 해주세요.');
        clearInterval(checkKakao);
      }
    }, 30000);

    return () => {
      clearInterval(checkKakao);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    try {
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 3
      };
      new window.kakao.maps.Map(mapRef.current, options);
    } catch (err) {
      setError('지도를 초기화하는 데 실패했습니다. 페이지를 새로고침 해주세요.');
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }
    };
  }, [isLoaded]);

  if (error) {
    return <LoadingContainer>{error}</LoadingContainer>;
  }

  if (!isLoaded) {
    return <LoadingContainer>지도를 불러오는 중입니다...</LoadingContainer>;
  }

  return <MapContainer ref={mapRef} />;
};

export default KakaoMap; 