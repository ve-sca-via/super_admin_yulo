import jwt from 'jsonwebtoken';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticatePartner = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'No token provided');
  }
  const token = header.slice(7);

  const revoked = await redis.get(`blacklist:${token}`);
  if (revoked !== null) {
    throw new ApiError(401, 'INVALID_TOKEN', 'Token has been revoked');
  }

  const decoded = jwt.verify(token, env.JWT_PARTNER_SECRET);

  const partner = await DeliveryPartner.findById(decoded.partnerId).lean();
  if (!partner) {
    throw new ApiError(401, 'INVALID_TOKEN', 'Delivery partner not found');
  }
  // DeliveryPartner has no isActive flag (unlike StaffMember) — 'suspended' is its equivalent
  // deactivated state, so block it here the same way authenticateStaff blocks !isActive.
  if (partner.status === 'suspended') {
    throw new ApiError(401, 'INVALID_TOKEN', 'Delivery partner account is suspended');
  }

  req.partner = {
    _id: partner._id,
    phone: partner.phone,
    fullName: partner.fullName,
    verificationStatus: partner.verificationStatus,
    fleetType: partner.fleetType,
    status: partner.status,
    currentLocation: partner.currentLocation,
    currentLocationUpdatedAt: partner.currentLocationUpdatedAt,
  };
  next();
});
