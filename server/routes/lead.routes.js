import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
} from '../controllers/lead.controller.js';

const router = Router();

// All lead routes require authentication
router.use(protect);

router.route('/')
  .get(getLeads)                           // user, manager, admin
  .post(createLead);                       // user, manager, admin

router.route('/:id')
  .get(getLead)                            // user, manager, admin
  .put(authorize('manager', 'admin'), updateLead)    // manager, admin
  .delete(authorize('admin'), deleteLead); // admin only

export default router;
