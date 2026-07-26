import { Router } from 'express';
import {
  createFleetChangeRequest,
  getFleetChangeRequests,
} from '../../controllers/partner/fleetChangeRequest.controller.js';
import { authenticatePartner } from '../../middleware/authenticatePartner.js';

const router = Router();

router.use(authenticatePartner);

router.post('/', createFleetChangeRequest);
router.get('/', getFleetChangeRequests);

export default router;
