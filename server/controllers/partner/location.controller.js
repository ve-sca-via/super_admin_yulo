import { z } from 'zod';
import DeliveryPartner from '../../models/DeliveryPartner.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

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

  sendSuccess(res, 200, 'Location updated', null);
});
