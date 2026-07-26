import { z } from 'zod';
import DeliveryPartner from '../../models/DeliveryPartner.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findById(req.partner._id).lean();
  if (!partner) throw new ApiError(404, 'NOT_FOUND', 'Delivery partner not found');
  sendSuccess(res, 200, 'Profile', { partner });
});

// Field list matches Notifications.jsx's toggle rows exactly (see the schema comment on
// DeliveryPartner.notificationPreferences).
const notificationPreferencesSchema = z.object({
  orders: z.boolean().optional(),
  payments: z.boolean().optional(),
  promotions: z.boolean().optional(),
  appUpdates: z.boolean().optional(),
  soundVibration: z.boolean().optional(),
});

export const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const result = notificationPreferencesSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid notification preferences', result.error.flatten());
  }

  const data = {};
  for (const [key, value] of Object.entries(result.data)) {
    data[`notificationPreferences.${key}`] = value;
  }

  const partner = await DeliveryPartner.findByIdAndUpdate(req.partner._id, { $set: data }, { new: true });
  if (!partner) throw new ApiError(404, 'NOT_FOUND', 'Delivery partner not found');

  sendSuccess(res, 200, 'Notification preferences updated', {
    notificationPreferences: partner.notificationPreferences,
  });
});
