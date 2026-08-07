import * as favoriteService from '../services/favorite.service.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listFavoriteRestaurants = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await favoriteService.listFavoriteRestaurants(req.user._id, page, limit);
  sendSuccess(res, 200, 'Favorite restaurants', result);
});

export const addFavoriteRestaurant = asyncHandler(async (req, res) => {
  await favoriteService.addRestaurantFavorite(req.user._id, req.params.restaurantId);
  sendSuccess(res, 201, 'Restaurant favorited', null);
});

export const removeFavoriteRestaurant = asyncHandler(async (req, res) => {
  await favoriteService.removeRestaurantFavorite(req.user._id, req.params.restaurantId);
  sendSuccess(res, 200, 'Restaurant unfavorited', null);
});

export const addFavoriteItem = asyncHandler(async (req, res) => {
  await favoriteService.addItemFavorite(req.user._id, req.params.menuItemId);
  sendSuccess(res, 201, 'Item favorited', null);
});

export const removeFavoriteItem = asyncHandler(async (req, res) => {
  await favoriteService.removeItemFavorite(req.user._id, req.params.menuItemId);
  sendSuccess(res, 200, 'Item unfavorited', null);
});
