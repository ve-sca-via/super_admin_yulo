import { Router } from 'express';
import { getItem } from '../controllers/item.controller.js';
import { optionalAuthenticate } from '../middleware/optionalAuthenticate.js';

const router = Router();

router.get('/:id', optionalAuthenticate, getItem);

export default router;
