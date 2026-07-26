import { Router } from 'express';
import { getCashInHandHandler, getEarningsHandler } from '../../controllers/partner/earnings.controller.js';
import { authenticatePartner } from '../../middleware/authenticatePartner.js';

const router = Router();

router.use(authenticatePartner);

router.get('/cash-in-hand', getCashInHandHandler);
router.get('/', getEarningsHandler);

export default router;
