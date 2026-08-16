import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import { getSummary } from '../controllers/checkout.controller.js';

const router = Router();

router.use(authenticate, authorizeRole('customer'));

router.get('/summary', getSummary);

export default router;
