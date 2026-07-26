import { z } from 'zod';
import DeliveryPartner from '../../models/DeliveryPartner.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const toggleSchema = z.object({ online: z.boolean() });

export const toggleDuty = asyncHandler(async (req, res) => {
  const result = toggleSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid duty toggle', result.error.flatten());
  }
  const { online } = result.data;

  const partner = await DeliveryPartner.findById(req.partner._id);
  if (!partner) throw new ApiError(404, 'NOT_FOUND', 'Delivery partner not found');

  // 'busy' and 'suspended' are not reachable through this endpoint in either direction:
  // 'suspended' is admin-only (authenticatePartner already blocks a suspended partner from
  // reaching here at all), and 'busy' is set/cleared only by deliveryAssignment.service.js based
  // on real active-order count. If the system currently has this partner marked busy, a manual
  // toggle must not clobber that bookkeeping in either direction.
  if (partner.status === 'busy') {
    throw new ApiError(409, 'PARTNER_BUSY', 'Cannot change duty status while on an active delivery');
  }

  if (online && partner.verificationStatus !== 'approved') {
    throw new ApiError(403, 'NOT_VERIFIED', 'Complete verification before going online');
  }

  partner.status = online ? 'active' : 'inactive';
  await partner.save();

  sendSuccess(res, 200, 'Duty status updated', {
    status: partner.status,
    verificationStatus: partner.verificationStatus,
  });
});

export const getDutyStatus = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findById(req.partner._id).lean();
  if (!partner) throw new ApiError(404, 'NOT_FOUND', 'Delivery partner not found');

  sendSuccess(res, 200, 'Duty status', {
    status: partner.status,
    verificationStatus: partner.verificationStatus,
  });
});
