import { Router } from 'express';
import {
  overview,
  revenueTrend,
  earningsVsSpending,
  restaurantRevenue,
} from '../../controllers/admin/finance.controller.js';

const router = Router();

router.get('/overview', overview);
router.get('/revenue-trend', revenueTrend);
router.get('/earnings-vs-spending', earningsVsSpending);
router.get('/restaurants', restaurantRevenue);

export default router;
