import { Router } from 'express';
import { topStores, topDeliveryPartners } from '../../controllers/admin/report.controller.js';

const router = Router();

router.get('/top-stores', topStores);
router.get('/top-delivery-partners', topDeliveryPartners);

export default router;
