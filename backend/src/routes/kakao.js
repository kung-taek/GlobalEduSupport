import express from 'express';
import { searchKeyword } from '../controllers/kakaoController.js';

const router = express.Router();

router.post('/search', searchKeyword);

export default router;
