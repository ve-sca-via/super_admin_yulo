import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import SupportTicket from '../models/SupportTicket.js';
import Bill from '../models/Bill.js';
import DeliveryPartner from '../models/DeliveryPartner.js';

export const STORE_STATUSES = ['pending', 'active', 'suspended', 'rejected', 'expired'];
const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export const shapeCounts = (statuses, aggResult) => {
  const shaped = Object.fromEntries(statuses.map((status) => [status, 0]));
  aggResult.forEach(({ _id, count }) => {
    if (_id in shaped) shaped[_id] = count;
  });
  return shaped;
};

export const getPlatformTotals = async () => {
  const [storeCounts, customerCount, ticketCounts, revenueAgg] = await Promise.all([
    Restaurant.aggregate([{ $group: { _id: '$approvalStatus', count: { $sum: 1 } } }]),
    User.countDocuments({ role: 'customer' }),
    SupportTicket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Bill.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' }, orders: { $sum: 1 } } },
    ]),
  ]);

  const revenue = revenueAgg[0] ?? { total: 0, orders: 0 };

  return {
    stores: shapeCounts(STORE_STATUSES, storeCounts),
    customers: customerCount,
    tickets: shapeCounts(TICKET_STATUSES, ticketCounts),
    revenue: { total: revenue.total, orders: revenue.orders },
  };
};

const RANGE_CONFIG = {
  day: { unit: 'hour', amount: 24 },
  week: { unit: 'day', amount: 7 },
  month: { unit: 'day', amount: 30 },
  year: { unit: 'month', amount: 12 },
};

export const getRevenueOverview = async (range) => {
  const config = RANGE_CONFIG[range] ?? RANGE_CONFIG.month;

  const since = new Date();
  if (config.unit === 'hour') since.setHours(since.getHours() - config.amount);
  else if (config.unit === 'day') since.setDate(since.getDate() - config.amount);
  else if (config.unit === 'month') since.setMonth(since.getMonth() - config.amount);

  const points = await Bill.aggregate([
    { $match: { status: 'paid', paidAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateTrunc: { date: '$paidAt', unit: config.unit } },
        revenue: { $sum: '$grandTotal' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return points.map((p) => ({ date: p._id, revenue: p.revenue, orders: p.orders }));
};

export const getTopStores = async (limit = 10) =>
  Bill.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: '$restaurantId', revenue: { $sum: '$grandTotal' }, orders: { $sum: 1 } } },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'restaurants',
        localField: '_id',
        foreignField: '_id',
        as: 'restaurant',
      },
    },
    { $unwind: '$restaurant' },
    {
      $project: {
        _id: 0,
        restaurantId: '$_id',
        revenue: 1,
        orders: 1,
        name: '$restaurant.name',
        avgRating: '$restaurant.avgRating',
      },
    },
  ]);

export const getTopDeliveryPartners = async (limit = 10) =>
  DeliveryPartner.find().sort({ totalDeliveries: -1 }).limit(limit).lean();
