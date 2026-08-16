import { Router } from 'express';
import {
  listRestaurants,
  getRestaurant,
  getMenu,
  searchRestaurantMenu,
  getMenuCategories,
  getReviews,
} from '../controllers/restaurant.controller.js';
import { optionalAuthenticate } from '../middleware/optionalAuthenticate.js';

const router = Router();

// optionalAuthenticate, not authenticate: these stay public/unauthenticated routes —
// it only lets the handlers thread `isFavorited` in when a valid customer token happens
// to be present, never requires one.
router.get('/', optionalAuthenticate, listRestaurants);
router.get('/:id', optionalAuthenticate, getRestaurant);
router.get('/:id/menu', optionalAuthenticate, getMenu);
router.get('/:id/menu/search', optionalAuthenticate, searchRestaurantMenu);
router.get('/:id/menu/categories', getMenuCategories);
router.get('/:id/reviews', getReviews);

export default router;
