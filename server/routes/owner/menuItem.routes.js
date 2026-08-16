import { Router } from 'express';
import { upload } from '../../middleware/upload.js';
import {
  list, create, getOne, update, remove, toggle, updateIngredients,
} from '../../controllers/owner/menuItem.controller.js';
import optionGroupRoutes from './optionGroup.routes.js';

const router = Router({ mergeParams: true });

router.get('/', list);
router.post('/', upload('image', 5), create);
router.get('/:itemId', getOne);
router.patch('/:itemId', upload('image', 5), update);
router.delete('/:itemId', remove);
router.patch('/:itemId/toggle', toggle);
router.patch('/:itemId/ingredients', updateIngredients);

router.use('/:itemId/option-groups', optionGroupRoutes);

export default router;
