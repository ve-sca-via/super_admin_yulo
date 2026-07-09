import DeliveryPartner from '../../models/DeliveryPartner.js';
import * as uploadService from '../../services/upload.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { logActivity } from '../../services/activityLog.service.js';

const UPDATABLE_FIELDS = [
  'fullName',
  'phone',
  'dateOfBirth',
  'gender',
  'emergencyPhone',
  'aadharNumber',
  'panNumber',
  'vehicle',
  'bankDetails',
  'status',
];

const DOCUMENT_FIELD_TYPES = {
  aadharCard: 'aadhar_card',
  drivingLicense: 'driving_license',
  vehicleRc: 'vehicle_rc',
  insuranceDocument: 'insurance_document',
  profilePhoto: 'profile_photo',
};

export const list = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [partners, total] = await Promise.all([
    DeliveryPartner.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    DeliveryPartner.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Delivery partners', {
    partners,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findById(req.params.id).lean();
  if (!partner) throw new ApiError(404, 'NOT_FOUND', 'Delivery partner not found');
  sendSuccess(res, 200, 'Delivery partner', { partner });
});

export const create = asyncHandler(async (req, res) => {
  const {
    fullName, email, phone, dateOfBirth, gender, emergencyPhone, aadharNumber, panNumber,
    vehicleModel, vehicleNumber, vehicleType, vehicleRcNumber, insuranceProvider,
    insuranceNumber, insuranceValidTill,
    bankName, accountHolderName, accountNumber, accountType, ifscCode, branchName, upiId,
  } = req.body;

  const partnerData = {
    fullName,
    email,
    phone,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    gender,
    emergencyPhone,
    aadharNumber,
    panNumber,
    vehicle: {
      model: vehicleModel,
      number: vehicleNumber,
      type: vehicleType,
      rcNumber: vehicleRcNumber,
      insuranceProvider,
      insuranceNumber,
      insuranceValidTill: insuranceValidTill ? new Date(insuranceValidTill) : undefined,
    },
    bankDetails: {
      bankName,
      accountHolderName,
      accountNumber,
      accountType,
      ifscCode,
      branchName,
      upiId,
    },
  };

  const uploadedPublicIds = [];
  const documents = [];
  const folder = `yulostores/delivery-partners/${Date.now()}`;

  try {
    for (const [fieldName, docType] of Object.entries(DOCUMENT_FIELD_TYPES)) {
      const file = req.files?.[fieldName]?.[0];
      if (!file) continue;

      const { secureUrl, publicId } = await uploadService.uploadBuffer({
        buffer: file.buffer,
        folder,
        publicId: `${fieldName}_${Date.now()}`,
        resourceType: file.mimetype === 'application/pdf' ? 'auto' : 'image',
      });
      uploadedPublicIds.push(publicId);
      documents.push({ type: docType, url: secureUrl });
    }
  } catch (uploadErr) {
    await Promise.all(uploadedPublicIds.map((id) => uploadService.deleteImage(id).catch(() => {})));
    throw new ApiError(500, 'UPLOAD_FAILED', uploadErr?.message ?? 'Document upload failed');
  }

  partnerData.documents = documents;

  let partner;
  try {
    partner = await DeliveryPartner.create(partnerData);
  } catch (err) {
    await Promise.all(uploadedPublicIds.map((id) => uploadService.deleteImage(id).catch(() => {})));
    throw err;
  }

  await logActivity({
    adminId: req.user._id,
    action: 'DELIVERY_PARTNER_ADDED',
    targetType: 'delivery_partner',
    targetId: partner._id,
  });

  sendSuccess(res, 201, 'Delivery partner created', { partner });
});

export const update = asyncHandler(async (req, res) => {
  const data = {};
  for (const field of UPDATABLE_FIELDS) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }

  const partner = await DeliveryPartner.findByIdAndUpdate(req.params.id, { $set: data }, { new: true });
  if (!partner) throw new ApiError(404, 'NOT_FOUND', 'Delivery partner not found');
  sendSuccess(res, 200, 'Delivery partner updated', { partner });
});

export const remove = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findById(req.params.id);
  if (!partner) throw new ApiError(404, 'NOT_FOUND', 'Delivery partner not found');

  await logActivity({
    adminId: req.user._id,
    action: 'DELIVERY_PARTNER_REMOVED',
    targetType: 'delivery_partner',
    targetId: partner._id,
  });

  await partner.deleteOne();
  sendSuccess(res, 200, 'Delivery partner removed', null);
});
