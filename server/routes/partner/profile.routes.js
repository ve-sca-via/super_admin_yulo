import { Router } from 'express';
import { getProfile } from '../../controllers/partner/profile.controller.js';
import { authenticatePartner } from '../../middleware/authenticatePartner.js';

const router = Router();

router.use(authenticatePartner);

router.get('/', getProfile);

export default router;
