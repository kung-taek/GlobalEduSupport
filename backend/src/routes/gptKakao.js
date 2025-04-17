import express from 'express';
import { getLocationCoordinates } from '../controllers/gptKakaoController.js';

const router = express.Router();

router.post('/gpt-location', getLocationCoordinates);

export default router;
