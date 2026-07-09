import { z } from 'zod';
import Restaurant from '../../models/Restaurant.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { logActivity } from '../../services/activityLog.service.js';
import { STORE_STATUSES, shapeCounts } from '../../services/adminStats.service.js';

const UPDATABLE_FIELDS = ['name', 'description', 'cuisineTypes', 'address', 'delivery', 'settings', 'plan'];

export const list = asyncHandler(async (req, res) => {
  const { status, plan, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.approvalStatus = status;
  if (plan) filter.plan = plan;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const [stores, total, statusCountsAgg] = await Promise.all([
    Restaurant.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('ownerId', 'name email phone')
      .lean(),
    Restaurant.countDocuments(filter),
    Restaurant.aggregate([{ $group: { _id: '$approvalStatus', count: { $sum: 1 } } }]),
  ]);

  sendSuccess(res, 200, 'Stores', {
    stores,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    statusCounts: shapeCounts(STORE_STATUSES, statusCountsAgg),
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const store = await Restaurant.findById(req.params.id).populate('ownerId', 'name email phone').lean();
  if (!store) throw new ApiError(404, 'NOT_FOUND', 'Store not found');
  sendSuccess(res, 200, 'Store', { store });
});

export const approve = asyncHandler(async (req, res) => {
  const store = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { $set: { approvalStatus: 'active', reviewedAt: new Date(), reviewedBy: req.user._id } },
    { new: true }
  );
  if (!store) throw new ApiError(404, 'NOT_FOUND', 'Store not found');

  await logActivity({
    adminId: req.user._id,
    action: 'STORE_APPROVED',
    targetType: 'restaurant',
    targetId: store._id,
  });

  sendSuccess(res, 200, 'Store approved', { store });
});

const rejectSchema = z.object({ reason: z.string().min(1) });

export const reject = asyncHandler(async (req, res) => {
  const result = rejectSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid reject data', result.error.flatten());
  }
  const { reason } = result.data;

  const store = await Restaurant.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        approvalStatus: 'rejected',
        rejectionReason: reason,
        reviewedAt: new Date(),
        reviewedBy: req.user._id,
      },
    },
    { new: true }
  );
  if (!store) throw new ApiError(404, 'NOT_FOUND', 'Store not found');

  await logActivity({
    adminId: req.user._id,
    action: 'STORE_REJECTED',
    targetType: 'restaurant',
    targetId: store._id,
    metadata: { reason },
  });

  sendSuccess(res, 200, 'Store rejected', { store });
});

export const suspend = asyncHandler(async (req, res) => {
  const store = await Restaurant.findById(req.params.id);
  if (!store) throw new ApiError(404, 'NOT_FOUND', 'Store not found');
  if (store.approvalStatus !== 'active') {
    throw new ApiError(400, 'INVALID_STATE', 'Only active stores can be suspended');
  }
  store.approvalStatus = 'suspended';
  await store.save();

  await logActivity({
    adminId: req.user._id,
    action: 'STORE_SUSPENDED',
    targetType: 'restaurant',
    targetId: store._id,
  });

  sendSuccess(res, 200, 'Store suspended', { store });
});

export const reactivate = asyncHandler(async (req, res) => {
  const store = await Restaurant.findById(req.params.id);
  if (!store) throw new ApiError(404, 'NOT_FOUND', 'Store not found');
  if (store.approvalStatus !== 'suspended') {
    throw new ApiError(400, 'INVALID_STATE', 'Only suspended stores can be reactivated');
  }
  store.approvalStatus = 'active';
  await store.save();

  await logActivity({
    adminId: req.user._id,
    action: 'STORE_REACTIVATED',
    targetType: 'restaurant',
    targetId: store._id,
  });

  sendSuccess(res, 200, 'Store reactivated', { store });
});

export const update = asyncHandler(async (req, res) => {
  const data = {};
  for (const field of UPDATABLE_FIELDS) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }

  const store = await Restaurant.findByIdAndUpdate(req.params.id, { $set: data }, { new: true });
  if (!store) throw new ApiError(404, 'NOT_FOUND', 'Store not found');
  sendSuccess(res, 200, 'Store updated', { store });
});

const noteSchema = z.object({ note: z.string().min(1) });

export const addNote = asyncHandler(async (req, res) => {
  const result = noteSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid note data', result.error.flatten());
  }
  const { note } = result.data;

  const store = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { $push: { adminNotes: { note, addedBy: req.user._id, addedAt: new Date() } } },
    { new: true }
  );
  if (!store) throw new ApiError(404, 'NOT_FOUND', 'Store not found');

  await logActivity({
    adminId: req.user._id,
    action: 'STORE_NOTE_ADDED',
    targetType: 'restaurant',
    targetId: store._id,
  });

  sendSuccess(res, 200, 'Note added', { store });
});

const verifyDocumentSchema = z.object({ status: z.enum(['verified', 'rejected']) });

export const verifyDocument = asyncHandler(async (req, res) => {
  const result = verifyDocumentSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid document status', result.error.flatten());
  }
  const { status } = result.data;

  const updateResult = await Restaurant.updateOne(
    { _id: req.params.id, 'documents._id': req.params.docId },
    { $set: { 'documents.$.status': status } }
  );
  if (updateResult.matchedCount === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'Store or document not found');
  }
  sendSuccess(res, 200, 'Document status updated', null);
});

export const remove = asyncHandler(async (req, res) => {
  const store = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: false } },
    { new: true }
  );
  if (!store) throw new ApiError(404, 'NOT_FOUND', 'Store not found');

  await logActivity({
    adminId: req.user._id,
    action: 'STORE_REMOVED',
    targetType: 'restaurant',
    targetId: store._id,
  });

  sendSuccess(res, 200, 'Store deactivated', { store });
});
