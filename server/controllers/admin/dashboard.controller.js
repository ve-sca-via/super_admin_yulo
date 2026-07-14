import * as adminStatsService from '../../services/adminStats.service.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const overview = asyncHandler(async (req, res) => {
  const totals = await adminStatsService.getPlatformTotals();
  sendSuccess(res, 200, 'Platform overview', totals);
});

export const revenueOverview = asyncHandler(async (req, res) => {
  const { range = 'month' } = req.query;
  const points = await adminStatsService.getRevenueOverview(range);
  sendSuccess(res, 200, 'Revenue overview', { range, points });
});

export const liveActivity = asyncHandler(async (req, res) => {
  const data = await adminStatsService.getLiveActivity();
  sendSuccess(res, 200, 'Live activity', data);
});

export const hourlyActivity = asyncHandler(async (req, res) => {
  const { days } = req.query;
  const data = await adminStatsService.getHourlyActivity(days ? Number(days) : undefined);
  sendSuccess(res, 200, 'Hourly activity', data);
});
