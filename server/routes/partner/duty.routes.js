import { Router } from 'express';
import { toggleDuty, getDutyStatus } from '../../controllers/partner/duty.controller.js';
import { authenticatePartner } from '../../middleware/authenticatePartner.js';

const router = Router();

router.use(authenticatePartner);

router.post('/toggle', toggleDuty);
router.get('/status', getDutyStatus);

export default router;
