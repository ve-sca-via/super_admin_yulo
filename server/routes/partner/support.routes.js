import { Router } from 'express';
import { createSupportTicket, listSupportTickets } from '../../controllers/partner/support.controller.js';
import { authenticatePartner } from '../../middleware/authenticatePartner.js';

const router = Router();

router.use(authenticatePartner);

router.post('/tickets', createSupportTicket);
router.get('/tickets', listSupportTickets);

export default router;
