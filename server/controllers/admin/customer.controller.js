import { z } from 'zod';
import User from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { logActivity } from '../../services/activityLog.service.js';

// Not a stored field — "Complete" means a customer has filled in enough of their
// profile (phone + at least one saved address) to actually place orders smoothly.
const isProfileComplete = (customer) =>
  Boolean(customer.phone) && (customer.savedAddresses?.length ?? 0) > 0;

const withProfileStatus = (customer) => ({
  ...customer,
  location: customer.savedAddresses?.[0]
    ? [customer.savedAddresses[0].city, customer.savedAddresses[0].state]
        .filter(Boolean)
        .join(', ')
    : null,
  profileStatus: isProfileComplete(customer) ? 'complete' : 'incomplete',
});

export const list = asyncHandler(async (req, res) => {
  const { search, status, profileStatus, page = 1, limit = 20 } = req.query;
  const conditions = [{ role: 'customer' }];
  if (status) conditions.push({ isActive: status === 'active' });
  if (search) {
    conditions.push({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ],
    });
  }
  if (profileStatus === 'complete') {
    conditions.push({ phone: { $ne: null } }, { 'savedAddresses.0': { $exists: true } });
  } else if (profileStatus === 'incomplete') {
    conditions.push({
      $or: [{ phone: null }, { 'savedAddresses.0': { $exists: false } }],
    });
  }
  const filter = { $and: conditions };

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
    customers: customers.map(withProfileStatus),
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
  sendSuccess(res, 200, 'Customer', { customer: withProfileStatus(customer) });
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
    adminId: req.user._id,
    action: isActive ? 'CUSTOMER_ACTIVATED' : 'CUSTOMER_DEACTIVATED',
    targetType: 'user',
    targetId: customer._id,
  });

  sendSuccess(res, 200, 'Customer status updated', { customer });
});
