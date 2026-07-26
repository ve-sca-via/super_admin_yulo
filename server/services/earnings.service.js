import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { getCurrentPeriod } from './payout.service.js';

const PERIOD_LABELS = { today: 'today', weekly: 'this week', monthly: 'this month' };

// Aggregates the SAME frozen per-order earningsBreakdown (Order.deliveryAssignment.earningsBreakdown,
// set once at delivery time — see controllers/partner/order.controller.js's deliverOrder) that a
// partner's own delivery summaries are built from, so this dashboard total always matches the sum
// of what they saw on each individual DeliverySummary.jsx screen for the period.
//
// See the comment on payout.service.js's ensurePayoutForPeriod for the full reconciliation
// picture: basePay here always equals admin's grossEarnings for the same partner/period exactly
// (same rate, same delivered-order set) — that's the authoritative, actually-paid number. The
// rest (distancePay/peakSurge/tips/incentiveBonus/idlePay) are informational estimates/placeholders
// not yet folded into what's actually paid out, so totalEarned here can exceed the admin figure —
// deliberately not hidden, since a partner should be able to see the fuller breakdown their app's
// design already shows, just not mistake it for a already-reconciled payout amount.
export const getEarningsForPeriod = async (partnerId, periodType = 'today') => {
  const { start, end } = getCurrentPeriod(periodType);

  const [agg] = await Order.aggregate([
    {
      $match: {
        'deliveryAssignment.partnerId': new mongoose.Types.ObjectId(partnerId),
        type: 'delivery',
        'deliveryAssignment.status': 'delivered',
        deliveredAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        orders: { $sum: 1 },
        basePay: { $sum: '$deliveryAssignment.earningsBreakdown.basePay' },
        distancePay: { $sum: '$deliveryAssignment.earningsBreakdown.distancePay' },
        peakSurge: { $sum: '$deliveryAssignment.earningsBreakdown.surgePay' },
        tips: { $sum: '$deliveryAssignment.earningsBreakdown.tip' },
        penalties: { $sum: '$deliveryAssignment.earningsBreakdown.penalty' },
      },
    },
  ]);

  const orders = agg?.orders ?? 0;
  const basePay = agg?.basePay ?? 0;
  const distancePay = agg?.distancePay ?? 0;
  const peakSurge = agg?.peakSurge ?? 0;
  const tips = agg?.tips ?? 0;
  const penalties = agg?.penalties ?? 0;

  // No incentive-target program exists anywhere in this codebase (Home.jsx's "🎯 3 more orders
  // before 3PM → ₹120 bonus" is a static mock with no backing logic) — 0, not fabricated.
  const incentiveBonus = 0;
  // No idle/waiting-time tracking exists either (Earnings.jsx's veg-fleet "idle-pay" row) —
  // same reasoning.
  const idlePay = 0;

  const totalEarned = basePay + distancePay + peakSurge + tips + incentiveBonus + idlePay - penalties;

  return {
    label: PERIOD_LABELS[periodType] ?? periodType,
    totalEarned,
    orders,
    incentiveBonus,
    idlePay,
    basePay,
    distancePay,
    peakSurge,
    tips,
    penalties,
  };
};
