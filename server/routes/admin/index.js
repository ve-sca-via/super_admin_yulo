import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRole } from '../../middleware/authorizeRole.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import storeRoutes from './store.routes.js';
import customerRoutes from './customer.routes.js';

const router = Router();

router.use(authenticate, authorizeRole('admin'));

router.get('/ping', (req, res) =>
  sendSuccess(res, 200, 'admin ok', { userId: req.user.userId, role: req.user.role })
);

router.use('/stores', storeRoutes);
router.use('/customers', customerRoutes);

export default router;
