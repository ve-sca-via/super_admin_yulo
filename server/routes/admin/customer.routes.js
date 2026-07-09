import { Router } from 'express';
import { list, getOne, setStatus } from '../../controllers/admin/customer.controller.js';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id/status', setStatus);

export default router;
