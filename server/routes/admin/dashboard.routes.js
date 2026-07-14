import { Router } from 'express';
import {
  overview,
  revenueOverview,
  liveActivity,
  hourlyActivity,
} from '../../controllers/admin/dashboard.controller.js';

const router = Router();

router.get('/', overview);
router.get('/revenue-overview', revenueOverview);
router.get('/live-activity', liveActivity);
router.get('/hourly-activity', hourlyActivity);

export default router;
