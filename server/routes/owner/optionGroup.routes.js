import { Router } from 'express';
import { list, create, update, remove } from '../../controllers/owner/optionGroup.controller.js';

const router = Router({ mergeParams: true });

router.get('/', list);
router.post('/', create);
router.patch('/:groupId', update);
router.delete('/:groupId', remove);

export default router;
