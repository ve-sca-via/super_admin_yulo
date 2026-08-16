import { z } from 'zod';
import User from '../models/User.js';
import * as userService from '../services/user.service.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const updateProfileSchema = z
  .object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    profilePicture: z.string().url().optional(),
    // `avatarUrl` is an accepted alias for `profilePicture`, not a second field — see the
    // comment on User.js's `preferences` field for why no separate avatarUrl column exists.
    avatarUrl: z.string().url().optional(),
  })
  .transform(({ avatarUrl, ...rest }) => (avatarUrl ? { ...rest, profilePicture: avatarUrl } : rest));

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash').lean();
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
  sendSuccess(res, 200, 'Profile', { user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const result = updateProfileSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid input', result.error.flatten());
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: result.data },
    { new: true }
  );
  sendSuccess(res, 200, 'Profile updated', { user });
});

export const addAddress = asyncHandler(async (req, res) => {
  const savedAddresses = await userService.addAddress(req.user._id, req.body);
  sendSuccess(res, 201, 'Address added', { savedAddresses });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const savedAddresses = await userService.updateAddress(req.user._id, req.params.addrId, req.body);
  sendSuccess(res, 200, 'Address updated', { savedAddresses });
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const savedAddresses = await userService.setDefaultAddress(req.user._id, req.params.addrId);
  sendSuccess(res, 200, 'Default address set', { savedAddresses });
});

export const removeAddress = asyncHandler(async (req, res) => {
  const savedAddresses = await userService.removeAddress(req.user._id, req.params.addrId);
  sendSuccess(res, 200, 'Address removed', { savedAddresses });
});

export const getPreferences = asyncHandler(async (req, res) => {
  const preferences = await userService.getPreferences(req.user._id);
  sendSuccess(res, 200, 'Preferences', { preferences });
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const preferences = await userService.updatePreferences(req.user._id, req.body);
  sendSuccess(res, 200, 'Preferences updated', { preferences });
});

export const registerDevice = asyncHandler(async (req, res) => {
  const { deviceToken, platform } = req.body;
  const device = await userService.registerDevice(req.user._id, deviceToken, platform);
  sendSuccess(res, 200, 'Device registered', { device });
});

export const removeDevice = asyncHandler(async (req, res) => {
  await userService.removeDevice(req.user._id, req.params.deviceToken);
  sendSuccess(res, 200, 'Device removed', null);
});
