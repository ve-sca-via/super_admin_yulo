import MenuItem from '../models/MenuItem.js';
import OptionGroup from '../models/OptionGroup.js';
import * as favoriteService from '../services/favorite.service.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findOne({
    _id: req.params.id,
    isAvailable: true,
  }).lean({ virtuals: true });
  if (!item) throw new ApiError(404, 'NOT_FOUND', 'Menu item not found');

  item.optionGroups = await OptionGroup.find({ menuItemId: item._id }).sort({ sortOrder: 1 }).lean();

  const favoritedIds = req.user
    ? await favoriteService.getFavoritedIdSet(req.user._id, 'menu_item')
    : null;
  favoriteService.annotateEntity(item, favoritedIds);

  sendSuccess(res, 200, 'Item detail', { item });
});
