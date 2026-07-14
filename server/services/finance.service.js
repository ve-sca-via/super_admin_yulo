import Bill from '../models/Bill.js';
import Restaurant from '../models/Restaurant.js';
import Payout from '../models/Payout.js';
import { computeCommission } from '../config/finance.config.js';
import { getPlatformPayoutTotal } from './payout.service.js';

// A dine-in Bill always has tableSessionId set (assembled from a TableSession, possibly
// batching several Orders); an online Bill (see billing.service.createOrderBill) always has
// orderId set instead. Bucketing on this is cheaper and more reliable than re-joining Order.
const BUCKET_EXPR = {
  $cond: [{ $ne: ['$tableSessionId', null] }, 'dineIn', 'online'],
};

const DEFAULT_RANGE_DAYS = 365;

const resolveRange = (from, to) => {
  const rangeTo = to ? new Date(to) : new Date();
  const rangeFrom = from
    ? new Date(from)
    : new Date(rangeTo.getTime() - DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000);
  return { rangeFrom, rangeTo };
};

export const getFinanceOverview = async ({ from, to } = {}) => {
  const { rangeFrom, rangeTo } = resolveRange(from, to);

  const [byBucket, deliveryPartnerPayout] = await Promise.all([
    Bill.aggregate([
      { $match: { status: 'paid', paidAt: { $gte: rangeFrom, $lte: rangeTo } } },
      { $group: { _id: BUCKET_EXPR, revenue: { $sum: '$grandTotal' } } },
    ]),
    getPlatformPayoutTotal({ from: rangeFrom, to: rangeTo }),
  ]);

  const onlineRevenue = byBucket.find((b) => b._id === 'online')?.revenue ?? 0;
  const dineInRevenue = byBucket.find((b) => b._id === 'dineIn')?.revenue ?? 0;
  const grossRevenue = onlineRevenue + dineInRevenue;
  const commissionRevenue = computeCommission(grossRevenue);
  const netPlatformProfit = commissionRevenue - deliveryPartnerPayout;

  return {
    grossRevenue,
    onlineRevenue,
    dineInRevenue,
    deliveryPartnerPayout,
    commissionRevenue,
    netPlatformProfit,
    range: { from: rangeFrom, to: rangeTo },
  };
};

export const getRevenueTrend = async ({ months = 12 } = {}) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const rows = await Bill.aggregate([
    { $match: { status: 'paid', paidAt: { $gte: since } } },
    {
      $group: {
        _id: { month: { $dateTrunc: { date: '$paidAt', unit: 'month' } }, bucket: BUCKET_EXPR },
        revenue: { $sum: '$grandTotal' },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  const byMonth = new Map();
  for (const row of rows) {
    const key = row._id.month.toISOString();
    const point = byMonth.get(key) ?? { date: row._id.month, online: 0, dineIn: 0 };
    point[row._id.bucket] = row.revenue;
    byMonth.set(key, point);
  }

  return [...byMonth.values()].sort((a, b) => a.date - b.date);
};

export const getEarningsVsSpending = async ({ months = 12 } = {}) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const [revenueRows, payoutRows] = await Promise.all([
    Bill.aggregate([
      { $match: { status: 'paid', paidAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateTrunc: { date: '$paidAt', unit: 'month' } },
          revenue: { $sum: '$grandTotal' },
        },
      },
    ]),
    Payout.aggregate([
      { $match: { periodStart: { $gte: since } } },
      {
        $group: {
          _id: { $dateTrunc: { date: '$periodStart', unit: 'month' } },
          spending: { $sum: '$netPayable' },
        },
      },
    ]),
  ]);

  const byMonth = new Map();
  for (const row of revenueRows) {
    const key = row._id.toISOString();
    byMonth.set(key, {
      date: row._id,
      earnings: computeCommission(row.revenue),
      spending: 0,
    });
  }
  for (const row of payoutRows) {
    const key = row._id.toISOString();
    const point = byMonth.get(key) ?? { date: row._id, earnings: 0, spending: 0 };
    point.spending = row.spending;
    byMonth.set(key, point);
  }

  return [...byMonth.values()].sort((a, b) => a.date - b.date);
};

export const getRestaurantRevenueTable = async ({ page = 1, limit = 10, from, to } = {}) => {
  const { rangeFrom, rangeTo } = resolveRange(from, to);
  const periodLengthMs = rangeTo.getTime() - rangeFrom.getTime();
  const previousFrom = new Date(rangeFrom.getTime() - periodLengthMs);
  const previousTo = rangeFrom;

  const perRestaurant = async (matchFrom, matchTo) =>
    Bill.aggregate([
      { $match: { status: 'paid', paidAt: { $gte: matchFrom, $lte: matchTo } } },
      {
        $group: {
          _id: { restaurantId: '$restaurantId', bucket: BUCKET_EXPR },
          revenue: { $sum: '$grandTotal' },
          orders: { $sum: 1 },
        },
      },
    ]);

  const [currentRows, previousRows] = await Promise.all([
    perRestaurant(rangeFrom, rangeTo),
    perRestaurant(previousFrom, previousTo),
  ]);

  const byRestaurant = new Map();
  for (const row of currentRows) {
    const id = row._id.restaurantId.toString();
    const entry = byRestaurant.get(id) ?? {
      restaurantId: row._id.restaurantId,
      onlineRevenue: 0,
      dineInRevenue: 0,
      orders: 0,
    };
    entry[row._id.bucket === 'online' ? 'onlineRevenue' : 'dineInRevenue'] = row.revenue;
    entry.orders += row.orders;
    byRestaurant.set(id, entry);
  }

  const previousTotals = new Map();
  for (const row of previousRows) {
    const id = row._id.restaurantId.toString();
    previousTotals.set(id, (previousTotals.get(id) ?? 0) + row.revenue);
  }

  const allEntries = [...byRestaurant.values()].map((entry) => {
    const totalRevenue = entry.onlineRevenue + entry.dineInRevenue;
    const previousRevenue = previousTotals.get(entry.restaurantId.toString()) ?? 0;
    const growthPercent =
      previousRevenue === 0 ? null : ((totalRevenue - previousRevenue) / previousRevenue) * 100;

    return {
      ...entry,
      totalRevenue,
      commission: computeCommission(totalRevenue),
      growthPercent,
    };
  });

  allEntries.sort((a, b) => b.totalRevenue - a.totalRevenue);

  const total = allEntries.length;
  const skip = (Number(page) - 1) * Number(limit);
  const pageEntries = allEntries.slice(skip, skip + Number(limit));

  const restaurants = await Restaurant.find({
    _id: { $in: pageEntries.map((e) => e.restaurantId) },
  })
    .select('name address.city approvalStatus')
    .lean();
  const restaurantMap = new Map(restaurants.map((r) => [r._id.toString(), r]));

  const rows = pageEntries.map((entry) => {
    const restaurant = restaurantMap.get(entry.restaurantId.toString());
    return {
      restaurantId: entry.restaurantId,
      name: restaurant?.name ?? 'Unknown',
      city: restaurant?.address?.city ?? '—',
      orders: entry.orders,
      onlineRevenue: entry.onlineRevenue,
      dineInRevenue: entry.dineInRevenue,
      totalRevenue: entry.totalRevenue,
      commission: entry.commission,
      growthPercent: entry.growthPercent,
      status: restaurant?.approvalStatus ?? 'unknown',
    };
  });

  return {
    rows,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  };
};
