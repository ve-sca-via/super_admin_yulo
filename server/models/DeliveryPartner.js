import mongoose from 'mongoose';

const deliveryPartnerDocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'aadhar_card',
        'driving_license',
        'vehicle_rc',
        'insurance_document',
        'profile_photo',
      ],
    },
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const deliveryPartnerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    emergencyPhone: { type: String },
    aadharNumber: { type: String },
    panNumber: { type: String },
    vehicle: {
      model: { type: String },
      number: { type: String },
      type: { type: String, enum: ['2_wheeler', 'ev_2_wheeler', 'non_rto_2_wheeler'] },
      rcNumber: { type: String },
      insuranceProvider: { type: String },
      insuranceNumber: { type: String },
      insuranceValidTill: { type: Date },
    },
    documents: [deliveryPartnerDocumentSchema],
    bankDetails: {
      bankName: { type: String },
      accountHolderName: { type: String },
      accountNumber: { type: String },
      accountType: { type: String, enum: ['savings', 'current'] },
      ifscCode: { type: String },
      branchName: { type: String },
      upiId: { type: String },
    },
    status: { type: String, enum: ['active', 'busy', 'inactive', 'suspended'], default: 'active' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalDeliveries: { type: Number, default: 0 },
    joinedOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

deliveryPartnerSchema.index({ email: 1 }, { unique: true });
deliveryPartnerSchema.index({ status: 1 });

export default mongoose.model('DeliveryPartner', deliveryPartnerSchema);
