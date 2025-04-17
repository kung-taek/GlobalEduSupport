import express from 'express';
import { handleGPTMessage } from '../controllers/gptController.js';

const router = express.Router();

router.post('/', handleGPTMessage);

export default router;
