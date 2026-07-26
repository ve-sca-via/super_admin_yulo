import Order from '../models/Order.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import { redis } from '../config/redis.js';
import { maxConcurrentOrdersPerPartner, perDeliveryRate, offerWindowSeconds } from '../config/finance.config.js';
import { getIO } from '../socket.js';
import logger from '../utils/logger.js';
import { computeDropKm, computePickupKm, isLocationFresh, LOCATION_FRESHNESS_SECONDS } from './geo.service.js';

// A partner-facing app now exists (Delivery-Partner). Assignment works as a real-time offer,
// not a silent write: the best eligible connected candidate gets an `order_offer` socket event
// with a fixed acceptance window; they accept/reject via the partner API, or the offer times
// out and re-offers to the next candidate. See acceptOrder/rejectOrder in
// controllers/partner/order.controller.js and sweepExpiredOffers below.

export const countActiveAssignments = (partnerId) =>
  Order.countDocuments({
    'deliveryAssignment.partnerId': partnerId,
    'deliveryAssignment.status': { $in: ['assigned', 'picked_up'] },
  });

const formatAddress = (addr) => [addr?.street, addr?.city].filter(Boolean).join(', ') || null;

// Distance-based ranking now that partner location tracking exists (see services/geo.service.js).
// Partners with a fresh (< LOCATION_FRESHNESS_SECONDS old) location ping within the restaurant's
// own configured delivery radius are ranked by actual proximity first — $near already returns
// them nearest-first. Everyone else (never pinged yet, or pinged too long ago to trust) still
// gets a fallback chance ranked by the original rating heuristic, so this is a strict improvement:
// no candidate is ever silently excluded just because they haven't started sending location pings
// (a realistic transitional state for a brand-new capability, not an edge case to ignore).
const rankCandidates = async (restaurant) => {
  const baseFilter = { status: 'active', verificationStatus: 'approved' };

  if (!restaurant?.location?.coordinates) {
    // No restaurant location on record — shouldn't normally happen (Restaurant.location is
    // required), but fall back entirely rather than crash a real order flow over it.
    return DeliveryPartner.find(baseFilter).sort({ rating: -1, totalDeliveries: 1 }).lean();
  }

  const freshCutoff = new Date(Date.now() - LOCATION_FRESHNESS_SECONDS * 1000);
  const maxDistanceMeters = (restaurant.delivery?.radiusKm ?? 5) * 1000;

  const nearby = await DeliveryPartner.find({
    ...baseFilter,
    currentLocationUpdatedAt: { $gte: freshCutoff },
    currentLocation: {
      $near: { $geometry: restaurant.location, $maxDistance: maxDistanceMeters },
    },
  }).lean();

  const nearbyIds = new Set(nearby.map((p) => p._id.toString()));
  const fallback = await DeliveryPartner.find({ ...baseFilter, _id: { $nin: [...nearbyIds] } })
    .sort({ rating: -1, totalDeliveries: 1 })
    .lean();

  return [...nearby, ...fallback];
};

// Shape matches Delivery-Partner/src/mocks/fixtures.js's mockOrders (veg/standard examples) field
// for field, since IncomingOrder.jsx will eventually consume this directly. Exported so
// GET /api/partner/orders/current (controllers/partner/order.controller.js) can return the exact
// same shape for an app that was backgrounded mid-offer, not just the live socket push.
export const buildOfferPayload = async (order, candidate) => {
  const [restaurant, customer] = await Promise.all([
    Restaurant.findById(order.restaurantId).select('name address location').lean(),
    order.userId ? User.findById(order.userId).select('name').lean() : null,
  ]);

  const dropKm = computeDropKm(restaurant, order);
  // Real when the candidate has a fresh location ping, null otherwise — never estimated from a
  // stale or missing position.
  const pickupKm = isLocationFresh(candidate.currentLocationUpdatedAt)
    ? computePickupKm(candidate.currentLocation, restaurant)
    : null;

  return {
    orderId: order._id,
    restaurantName: restaurant?.name ?? null,
    restaurantAddress: formatAddress(restaurant?.address),
    // Reflects the PARTNER being offered this order, not the order itself — Order has no fleet
    // concept of its own (no schema field for it); this app's veg/standard split is a property
    // of which fleet the partner belongs to, not something the customer chose.
    fleetType: candidate.fleetType,
    pickupKm,
    dropKm,
    totalKm: pickupKm != null && dropKm != null ? Number((pickupKm + dropKm).toFixed(1)) : null,
    // Flat-rate estimate, same rate the admin payout system already uses — becomes the real
    // itemized basePay/distancePay/surge/tip breakdown once the itemized-earnings step exists;
    // not fabricating a distance-based fare formula ahead of that.
    fare: perDeliveryRate,
    payment: order.paymentMethod === 'cash' ? 'cod' : 'prepaid',
    codAmount: order.paymentMethod === 'cash' ? order.subtotal : undefined,
    items: order.items.map((i) => ({ name: i.name, qty: i.quantity })),
    customerName: customer?.name ?? null,
    customerAddress: formatAddress(order.deliveryAddress),
    // Still no real routing/ETA engine (straight-line distance ≠ travel time) — see the
    // geo.service.js file comment on why that's a separate, larger capability than this step adds.
    customerEtaMin: null,
    pickupEtaMin: null,
    countdownSeconds: offerWindowSeconds,
  };
};

export const autoAssign = async (order) => {
  if (order.type !== 'delivery') return null;

  const alreadyTried = new Set(
    (order.deliveryAssignment?.history || []).map((h) => h.partnerId?.toString()).filter(Boolean)
  );
  if (order.deliveryAssignment?.partnerId) {
    alreadyTried.add(order.deliveryAssignment.partnerId.toString());
  }

  const onlinePartnerIds = new Set(await redis.smembers('live:active_partners'));

  const restaurant = await Restaurant.findById(order.restaurantId).select('location delivery.radiusKm').lean();
  const candidates = await rankCandidates(restaurant);

  for (const candidate of candidates) {
    const candidateId = candidate._id.toString();
    if (alreadyTried.has(candidateId)) continue;
    if (!onlinePartnerIds.has(candidateId)) continue;

    const activeCount = await countActiveAssignments(candidate._id);
    if (activeCount >= maxConcurrentOrdersPerPartner) continue;

    // A candidate mid-offer on a different order shouldn't be offered a second one at the same
    // time — not asked for explicitly, but without this a partner could get two simultaneous
    // `order_offer` pushes, which IncomingOrder.jsx has no UI for.
    const busyWithAnotherOffer = await Order.exists({
      _id: { $ne: order._id },
      'deliveryAssignment.offeredTo': candidate._id,
      'deliveryAssignment.offerStatus': 'offered',
      'deliveryAssignment.offerExpiresAt': { $gt: new Date() },
    });
    if (busyWithAnotherOffer) continue;

    const offerExpiresAt = new Date(Date.now() + offerWindowSeconds * 1000);
    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          'deliveryAssignment.offeredTo': candidate._id,
          'deliveryAssignment.offerExpiresAt': offerExpiresAt,
          'deliveryAssignment.offerStatus': 'offered',
        },
      }
    );

    const payload = await buildOfferPayload(order, candidate);
    try {
      getIO().to(`partner:${candidateId}`).emit('order_offer', payload);
    } catch (err) {
      logger.error({ err, orderId: order._id, partnerId: candidateId }, 'Failed to emit order_offer');
    }

    return candidate._id;
  }

  // No eligible partner right now — leave unassigned. Never throw: this must not
  // block the kitchen's own status transition. Visible/reassignable by admin later.
  return null;
};

// Timeout strategy: no cron/job-queue dependency exists anywhere in this codebase, and
// payout.service.js's ensurePayoutForPeriod already establishes a "compute freshness on read"
// convention for time-based state instead of a scheduler. That convention alone isn't enough
// here, though — an offer nobody ever reads again (app closed, partner never taps anything) would
// sit 'offered' forever with no natural trigger to free it up. So this uses BOTH: expireIfStale
// is the lazy on-read check (called from GET /orders/current and the accept/reject endpoints,
// consistent with ensurePayoutForPeriod's philosophy), and sweepExpiredOffers is a small periodic
// scan — the same shape as the live_visitor_update setInterval socket.js already runs every 30s,
// just on a tighter interval to match a ~20s offer window. Neither is a new dependency.
const expireAndReassign = async (order) => {
  const now = new Date();
  order.deliveryAssignment.offerStatus = 'expired';
  order.deliveryAssignment.history.push({
    partnerId: order.deliveryAssignment.offeredTo,
    assignedAt: order.deliveryAssignment.offerExpiresAt,
    assignedBy: 'auto',
    unassignedAt: now,
    reason: 'expired',
  });
  await order.save();
  return autoAssign(order);
};

export const expireIfStale = async (order) => {
  const isStaleOffer =
    order.deliveryAssignment?.offerStatus === 'offered' &&
    order.deliveryAssignment.offerExpiresAt &&
    order.deliveryAssignment.offerExpiresAt <= new Date();

  if (!isStaleOffer) return false;
  await expireAndReassign(order);
  return true;
};

export const sweepExpiredOffers = async () => {
  const staleOrders = await Order.find({
    type: 'delivery',
    'deliveryAssignment.offerStatus': 'offered',
    'deliveryAssignment.offerExpiresAt': { $lte: new Date() },
  });

  for (const order of staleOrders) {
    try {
      await expireAndReassign(order);
    } catch (err) {
      logger.error({ err, orderId: order._id }, 'Failed to expire/reassign stale offer');
    }
  }
};
