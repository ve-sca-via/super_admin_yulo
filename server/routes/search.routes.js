import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getTypeahead,
  getPopular,
  listRecent,
  createRecent,
  removeRecent,
} from '../controllers/search.controller.js';

const router = Router();

// Typeahead/popular are public — no personalization in their response shape (no
// isFavorited, no user-specific ranking), unlike recent searches which are the caller's
// own history and require a real customer identity.
router.get('/typeahead', getTypeahead);
router.get('/popular', getPopular);

router.get('/recent', authenticate, listRecent);
router.post('/recent', authenticate, createRecent);
router.delete('/recent/:id', authenticate, removeRecent);

export default router;
