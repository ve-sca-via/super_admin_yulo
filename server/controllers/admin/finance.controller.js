import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  getFinanceOverview,
  getRevenueTrend,
  getEarningsVsSpending,
  getRestaurantRevenueTable,
} from '../../services/finance.service.js';

export const overview = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await getFinanceOverview({ from, to });
  sendSuccess(res, 200, 'Finance overview', data);
});

export const revenueTrend = asyncHandler(async (req, res) => {
  const { months } = req.query;
  const points = await getRevenueTrend({ months: months ? Number(months) : undefined });
  sendSuccess(res, 200, 'Revenue trend', { points });
});

export const earningsVsSpending = asyncHandler(async (req, res) => {
  const { months } = req.query;
  const points = await getEarningsVsSpending({ months: months ? Number(months) : undefined });
  sendSuccess(res, 200, 'Earnings vs spending', { points });
});

export const restaurantRevenue = asyncHandler(async (req, res) => {
  const { page, limit, from, to } = req.query;
  const data = await getRestaurantRevenueTable({ page, limit, from, to });
  sendSuccess(res, 200, 'Restaurant revenue', data);
});
