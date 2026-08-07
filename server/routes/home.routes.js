import { Router } from 'express';
import { getFeed } from '../controllers/home.controller.js';
import { optionalAuthenticate } from '../middleware/optionalAuthenticate.js';

const router = Router();

// Public/optional-auth, same as restaurant browsing — isFavorited is only threaded in
// when a valid customer token is present.
router.get('/feed', optionalAuthenticate, getFeed);

export default router;
