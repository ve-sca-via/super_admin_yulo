import { z } from 'zod';
import DeliveryPartner from '../../models/DeliveryPartner.js';
import Order from '../../models/Order.js';
import { getIO } from '../../socket.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';

// [lng, lat], GeoJSON order — matches every other coordinates field in this codebase
// (Restaurant.location, Order.deliveryAddress.coordinates).
const locationSchema = z.object({
  coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
});

export const updateLocation = asyncHandler(async (req, res) => {
  const result = locationSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid coordinates', result.error.flatten());
  }

  // `type` and `coordinates` are always set together here — never let a partial GeoJSON value
  // exist on this document (see the schema comment on DeliveryPartner.currentLocation).
  await DeliveryPartner.updateOne(
    { _id: req.partner._id },
    {
      $set: {
        currentLocation: { type: 'Point', coordinates: result.data.coordinates },
        currentLocationUpdatedAt: new Date(),
      },
    }
  );

  // Live-only broadcast to whichever order this partner is actively out for delivery on
  // (if any) — no location-history collection, matching this codebase's established
  // "don't over-engineer live state" precedent (see geo.service.js's
  // LOCATION_FRESHNESS_SECONDS: only the latest ping is ever kept, nothing is archived).
  const activeOrder = await Order.findOne({
    'deliveryAssignment.partnerId': req.partner._id,
    'deliveryAssignment.status': 'picked_up',
  })
    .select('_id')
    .lean();

  if (activeOrder) {
    const [lng, lat] = result.data.coordinates;
    try {
      getIO().to(`order:${activeOrder._id}`).emit('partner_location_updated', {
        orderId: activeOrder._id,
        lat,
        lng,
      });
    } catch (err) {
      logger.error({ err, orderId: activeOrder._id }, 'Failed to emit partner_location_updated');
    }
  }

  sendSuccess(res, 200, 'Location updated', null);
});
