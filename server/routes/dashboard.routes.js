import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getStats } from '../controllers/dashboard.controller.js';

const router = Router();

router.use(protect);
router.get('/stats', getStats);

export default router;
