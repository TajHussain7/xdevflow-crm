import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getActivityByLead } from '../controllers/activity.controller.js';

const router = Router();

router.use(protect);
router.get('/:leadId', getActivityByLead);

export default router;
