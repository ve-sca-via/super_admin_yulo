import { Router } from 'express';
import { overview, revenueOverview } from '../../controllers/admin/dashboard.controller.js';

const router = Router();

router.get('/', overview);
router.get('/revenue-overview', revenueOverview);

export default router;
