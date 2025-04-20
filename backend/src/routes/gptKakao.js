import express from 'express';
import { getLocationCoordinates } from '../controllers/gptKakaoController.js';

const router = express.Router();

// 자연어로 입력된 위치 정보를 GPT로 분석하여 카카오맵 좌표로 변환
// (예: "서울역에서 대전역 가고 싶어" → 출발지, 도착지 좌표 반환)
router.post('/gpt-location', getLocationCoordinates);

export default router;
