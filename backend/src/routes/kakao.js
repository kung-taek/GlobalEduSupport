import express from 'express';
import { kakaoController } from '../controllers/kakaoController.js';

const router = express.Router();

router.post('/', kakaoController);

export default router;
