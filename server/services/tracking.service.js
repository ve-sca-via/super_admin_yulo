import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import { ApiError } from '../utils/ApiError.js';
import { haversineKm, estimateEtaMinutes, isLocationFresh } from './geo.service.js';

// Order.status is a single mutable field with no per-stage history (no statusHistory
// array exists) — updatedAt only ever reflects the LAST write, so it's only trustworthy
// as a timestamp for whichever stage is the order's CURRENT status, never for an earlier
// one that's since been overwritten. Rather than fabricate timestamps this codebase
// doesn't actually have, each stage below gets a real one only where genuinely available:
// 'placed' (createdAt, always real), 'delivered' (deliveredAt, always real), the current
// stage (updatedAt, real for that one transition), and 'out_for_delivery' additionally
// prefers deliveryAssignment.pickupOtpVerifiedAt when set (a more precise, independently
// real signal of when the partner actually picked up) — every other already-completed
// stage gets `timestamp: null` rather than a guess.
const STATUS_STAGES = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

const buildTimeline = (order) => {
  const currentIndex = STATUS_STAGES.indexOf(order.status);
  return STATUS_STAGES.map((stage, index) => {
    const completed = order.status === 'delivered' ? true : index <= currentIndex;

    let timestamp = null;
    if (stage === 'placed') {
      timestamp = order.createdAt;
    } else if (stage === 'delivered') {
      timestamp = order.deliveredAt;
    } else if (stage === 'out_for_delivery') {
      timestamp =
        order.deliveryAssignment?.pickupOtpVerifiedAt ?? (order.status === stage ? order.updatedAt : null);
    } else if (order.status === stage) {
      timestamp = order.updatedAt;
    }

    return { stage, timestamp: timestamp ?? null, completed };
  });
};

export const getOrderTracking = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, userId }).lean();
  if (!order) throw new ApiError(404, 'NOT_FOUND', 'Order not found');
  if (order.type !== 'delivery') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Only delivery orders can be tracked');
  }

  const restaurant = await Restaurant.findById(order.restaurantId).select('name avgRating').lean();

  let deliveryPartner = null;
  let etaMinutes = null;

  const partnerId = order.deliveryAssignment?.partnerId;
  if (partnerId) {
    const partner = await DeliveryPartner.findById(partnerId).lean();
    if (partner) {
      const profilePhoto = partner.documents?.find((d) => d.type === 'profile_photo');
      deliveryPartner = {
        name: partner.fullName || null,
        avatarUrl: profilePhoto?.url ?? null,
        rating: partner.rating,
        totalDeliveries: partner.totalDeliveries,
        usesVegOnlyFleetBag: order.dedicatedBagRequired,
      };

      // Only computed for the picked_up leg (partner -> customer) — matches the Figma
      // export, where "Arriving in X mins" only appears alongside the "On the way" pill,
      // not the earlier assigned-but-not-yet-picked-up phase. Only ever estimated from a
      // genuinely fresh location ping, never a stale/missing one.
      const isEnRouteToCustomer = order.deliveryAssignment.status === 'picked_up';
      if (isEnRouteToCustomer && isLocationFresh(partner.currentLocationUpdatedAt) && order.deliveryAddress?.coordinates) {
        const distanceKm = haversineKm(partner.currentLocation.coordinates, order.deliveryAddress.coordinates);
        etaMinutes = estimateEtaMinutes(distanceKm);
      }
    }
  }

  return {
    status: order.status,
    etaMinutes,
    timeline: buildTimeline(order),
    restaurant: { name: restaurant?.name ?? null, rating: restaurant?.avgRating ?? null },
    deliveryPartner,
    orderItems: order.items,
    totalPaid: order.grandTotal ?? order.subtotal,
  };
};
