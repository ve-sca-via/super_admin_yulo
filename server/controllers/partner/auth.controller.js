import jwt from 'jsonwebtoken';
import DeliveryPartner from '../../models/DeliveryPartner.js';
import * as otpService from '../../services/otp.service.js';
import * as authService from '../../services/auth.service.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const requestOtpHandler = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const result = await otpService.requestOtp(phone);
  sendSuccess(res, 200, 'OTP sent', result);
});

export const verifyOtpHandler = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  await otpService.verifyOtp(phone, otp);

  let partner = await DeliveryPartner.findOne({ phone });
  if (!partner) {
    // First touchpoint for a brand-new partner — just phone + verification state. Full
    // onboarding (name, vehicle, bank, documents) is submitted separately in a later step.
    // status is forced to 'inactive' here (overriding the schema's 'active' default): an
    // unverified partner must not be eligible for auto-assignment before KYC approval. The
    // duty-toggle endpoint (a later step) is what flips this to 'active', and only once
    // verificationStatus === 'approved'.
    partner = await DeliveryPartner.create({
      phone,
      verificationStatus: 'pending_documents',
      status: 'inactive',
    });
  }

  if (partner.status === 'suspended') {
    throw new ApiError(401, 'ACCOUNT_SUSPENDED', 'This delivery partner account is suspended');
  }

  const { accessToken, refreshToken } = authService.generatePartnerTokens(partner._id);

  sendSuccess(res, 200, 'Login successful', { partner, accessToken, refreshToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, 'VALIDATION_ERROR', 'refreshToken is required');

  const decoded = jwt.verify(refreshToken, env.JWT_PARTNER_SECRET);

  const partner = await DeliveryPartner.findById(decoded.partnerId).lean();
  if (!partner) throw new ApiError(401, 'INVALID_TOKEN', 'Delivery partner not found');
  if (partner.status === 'suspended') {
    throw new ApiError(401, 'INVALID_TOKEN', 'Delivery partner account is suspended');
  }

  const accessToken = authService.generatePartnerAccessToken(partner._id);
  sendSuccess(res, 200, 'Token refreshed', { accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    await authService.blacklistToken(header.slice(7));
  }
  sendSuccess(res, 200, 'Logged out', null);
});
