import express from 'express';
import { handleGPTMessage } from '../controllers/gptController.js';

const router = express.Router();

// GPT API를 사용한 일반 대화 처리 (사용자 메시지에 대한 GPT 응답)
router.post('/', handleGPTMessage);

export default router;
