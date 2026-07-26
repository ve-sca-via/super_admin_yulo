import { Router } from 'express';
import { getStatus, patchProgress, postComplete } from '../../controllers/partner/training.controller.js';
import { authenticatePartner } from '../../middleware/authenticatePartner.js';

const router = Router();

router.use(authenticatePartner);

router.get('/status', getStatus);
router.patch('/progress', patchProgress);
router.post('/:moduleId/complete', postComplete);

export default router;
