import express from 'express';
import { getRouteInfo } from '../controllers/routeController.js';

const router = express.Router();

router.post('/', getRouteInfo);

export default router;
