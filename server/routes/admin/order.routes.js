import { Router } from 'express';
import { reassignDeliveryPartner } from '../../controllers/admin/order.controller.js';

const router = Router();

router.patch('/:id/delivery-partner', reassignDeliveryPartner);

export default router;
