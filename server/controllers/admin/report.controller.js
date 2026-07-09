import * as adminStatsService from '../../services/adminStats.service.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const topStores = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const stores = await adminStatsService.getTopStores(Number(limit));
  sendSuccess(res, 200, 'Top stores', { stores });
});

export const topDeliveryPartners = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const partners = await adminStatsService.getTopDeliveryPartners(Number(limit));
  sendSuccess(res, 200, 'Top delivery partners', { partners });
});
