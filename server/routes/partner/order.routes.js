import { Router } from 'express';
import {
  acceptOrder,
  rejectOrder,
  getCurrentOrder,
  verifyPickup,
  deliverOrder,
  getOrderSummary,
} from '../../controllers/partner/order.controller.js';
import { authenticatePartner } from '../../middleware/authenticatePartner.js';

const router = Router();

router.use(authenticatePartner);

router.get('/current', getCurrentOrder);
router.post('/:orderId/accept', acceptOrder);
router.post('/:orderId/reject', rejectOrder);
router.post('/:orderId/verify-pickup', verifyPickup);
router.post('/:orderId/deliver', deliverOrder);
router.get('/:orderId/summary', getOrderSummary);

export default router;
