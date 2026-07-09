import { z } from 'zod';
import User from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { logActivity } from '../../services/activityLog.service.js';

export const list = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const filter = { role: 'customer' };
  if (status) filter.isActive = status === 'active';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [customers, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-passwordHash')
      .lean(),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Customers', {
    customers,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' })
    .select('-passwordHash')
    .lean();
  if (!customer) throw new ApiError(404, 'NOT_FOUND', 'Customer not found');
  sendSuccess(res, 200, 'Customer', { customer });
});

const setStatusSchema = z.object({ isActive: z.boolean() });

export const setStatus = asyncHandler(async (req, res) => {
  const result = setStatusSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid status data', result.error.flatten());
  }
  const { isActive } = result.data;

  const customer = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'customer' },
    { $set: { isActive } },
    { new: true }
  ).select('-passwordHash');
  if (!customer) throw new ApiError(404, 'NOT_FOUND', 'Customer not found');

  await logActivity({
    adminId: req.user.userId,
    action: isActive ? 'CUSTOMER_ACTIVATED' : 'CUSTOMER_DEACTIVATED',
    targetType: 'user',
    targetId: customer._id,
  });

  sendSuccess(res, 200, 'Customer status updated', { customer });
});
