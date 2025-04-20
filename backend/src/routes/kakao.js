import express from 'express';
import { searchKeyword, getRouteInfo } from '../controllers/kakaoController.js';

const router = express.Router();

// 키워드로 장소 검색 API (예: "서울대학교" 검색 시 좌표와 장소 정보 반환)
// Request: { keyword: "검색할 장소명" }
// Response: { location: { place_name, x, y, address_name, ... } }
router.post('/search', searchKeyword);

// 두 지점 간 경로 검색 API (카카오 모빌리티 API 사용)
// Request: { from: "출발지명", to: "도착지명" }
// Response: { distance: 이동거리(m), duration: 소요시간(s), path: [...경로좌표들] }
router.post('/route', getRouteInfo);

export default router;
