import { Router } from 'express';
import { list, getOne, update, addMessage } from '../../controllers/admin/ticket.controller.js';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id', update);
router.post('/:id/messages', addMessage);

export default router;
