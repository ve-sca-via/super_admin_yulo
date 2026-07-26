import { Router } from 'express';
import { updateNotificationPreferences } from '../../controllers/partner/profile.controller.js';
import { authenticatePartner } from '../../middleware/authenticatePartner.js';

const router = Router();

router.use(authenticatePartner);

router.patch('/', updateNotificationPreferences);

export default router;
