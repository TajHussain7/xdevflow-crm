import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { getUsers, updateUserRole } from '../controllers/user.controller.js';

const router = Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.patch('/:id/role', updateUserRole);

export default router;
