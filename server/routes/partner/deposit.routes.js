import { Router } from 'express';
import { createDeposit, listDeposits } from '../../controllers/partner/deposit.controller.js';
import { authenticatePartner } from '../../middleware/authenticatePartner.js';

const router = Router();

router.use(authenticatePartner);

router.post('/', createDeposit);
router.get('/', listDeposits);

export default router;
