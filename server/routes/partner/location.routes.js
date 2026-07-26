import { Router } from 'express';
import { updateLocation } from '../../controllers/partner/location.controller.js';
import { authenticatePartner } from '../../middleware/authenticatePartner.js';

const router = Router();

router.use(authenticatePartner);

router.post('/', updateLocation);

export default router;
