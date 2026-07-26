import Payout from '../models/Payout.js';
import Order from '../models/Order.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import { ApiError } from '../utils/ApiError.js';
import { perDeliveryRate } from '../config/finance.config.js';

// Shared by Financial Analytics (server/services/finance.service.js) and the delivery
// partner payout endpoints, so the two pages can never disagree on the platform's total
// delivery-partner spend for a period. Returns 0 (a real query against an empty/partial
// collection) until Payout docs exist for the period — never fabricated.
export const getPlatformPayoutTotal = async ({ from, to }) => {
  const [result] = await Payout.aggregate([
    { $match: { periodStart: { $gte: from }, periodEnd: { $lte: to } } },
    { $group: { _id: null, total: { $sum: '$netPayable' } } },
  ]);
  return result?.total ?? 0;
};

// 'today' added for services/earnings.service.js's partner-facing GET /api/partner/earnings
// (Delivery-Partner's Earnings.jsx has a Today tab that this Payout-oriented function never
// needed before) — reused here rather than reimplemented, per weekly/monthly's own existing
// convention below.
export const getCurrentPeriod = (periodType = 'weekly') => {
  const now = new Date();
  if (periodType === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  if (periodType === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }
  const dayOfWeek = now.getDay(); // 0 Sun .. 6 Sat
  const diffToMonday = (dayOfWeek + 6) % 7;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Computed-on-read + upserted (no scheduler/cron exists in this codebase). Never clobbers
// admin-entered incentives/deductions on an existing doc for the same period.
//
// grossEarnings here (deliveriesCount * perDeliveryRate) is deliberately NOT changed to sum
// services/earnings.service.js's itemized per-order earningsBreakdown instead, even though that
// breakdown now exists (see Order.deliveryAssignment.earningsBreakdown). This IS the authoritative,
// actually-paid amount — perDeliveryRate is the one admin-configured, funded rate in this system.
// The itemized breakdown's basePay component always equals this exactly (same rate, same
// delivered-in-period order set), so the two views never drift on the part that's real money.
// Its extra distancePay (and always-zero surgePay/tip/penalty placeholders) are NOT folded in
// here because there's no admin-approved rate/engine backing them as an actual payout
// commitment — see the comment on finance.config.js's perKmRate. A partner's own earnings view
// will therefore show totalEarned >= this grossEarnings; that gap is the informational estimate,
// not money currently owed.
export const ensurePayoutForPeriod = async (partnerId, periodType) => {
  const { start, end } = getCurrentPeriod(periodType);

  const deliveriesCount = await Order.countDocuments({
    'deliveryAssignment.partnerId': partnerId,
    type: 'delivery',
    'deliveryAssignment.status': 'delivered',
    deliveredAt: { $gte: start, $lte: end },
  });
  const grossEarnings = deliveriesCount * perDeliveryRate;

  const existing = await Payout.findOne({ partnerId, periodStart: start });
  const incentives = existing?.incentives ?? 0;
  const deductions = existing?.deductions ?? 0;

  return Payout.findOneAndUpdate(
    { partnerId, periodStart: start },
    {
      $set: {
        periodType,
        periodEnd: end,
        deliveriesCount,
        perDeliveryRate,
        grossEarnings,
        netPayable: grossEarnings + incentives - deductions,
      },
      $setOnInsert: { incentives: 0, deductions: 0, status: 'pending' },
    },
    { upsert: true, new: true }
  );
};

export const listPayoutsForPartner = async (partnerId, { periodType = 'weekly', page = 1, limit = 10 } = {}) => {
  await ensurePayoutForPeriod(partnerId, periodType);

  const filter = { partnerId, periodType };
  const skip = (Number(page) - 1) * Number(limit);
  const [rows, total] = await Promise.all([
    Payout.find(filter).sort({ periodStart: -1 }).skip(skip).limit(Number(limit)).lean(),
    Payout.countDocuments(filter),
  ]);

  return { rows, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
};

export const adjustPayout = async (payoutId, { incentives, deductions, notes, adjustedBy }) => {
  const payout = await Payout.findById(payoutId);
  if (!payout) throw new ApiError(404, 'NOT_FOUND', 'Payout not found');

  if (incentives !== undefined) payout.incentives = incentives;
  if (deductions !== undefined) payout.deductions = deductions;
  if (notes !== undefined) payout.notes = notes;
  payout.netPayable = payout.grossEarnings + payout.incentives - payout.deductions;
  payout.adjustedBy = adjustedBy;

  await payout.save();
  return payout;
};

export const markPayoutsPaid = async (payoutIds) => {
  const now = new Date();
  const result = await Payout.updateMany(
    { _id: { $in: payoutIds }, status: { $in: ['pending', 'processing'] } },
    { $set: { status: 'paid', paidAt: now } }
  );
  return result.modifiedCount;
};

// Ensures every partner has a current-period payout doc, then aggregates for the
// PartnersList stat cards (Total Payable / Already Paid / Pending Payments count).
export const getPayoutSummary = async (periodType = 'weekly') => {
  const partners = await DeliveryPartner.find().select('_id').lean();
  await Promise.all(partners.map((p) => ensurePayoutForPeriod(p._id, periodType)));

  const { start } = getCurrentPeriod(periodType);
  const rows = await Payout.find({ periodType, periodStart: start }).lean();

  const totalPayable = rows
    .filter((r) => r.status !== 'paid')
    .reduce((sum, r) => sum + r.netPayable, 0);
  const alreadyPaid = rows.filter((r) => r.status === 'paid').length;
  const pendingCount = rows.filter((r) => r.status !== 'paid').length;

  return {
    totalPayable,
    partnersEligible: rows.length,
    alreadyPaid,
    pendingPayments: pendingCount,
    payouts: rows,
  };
};
