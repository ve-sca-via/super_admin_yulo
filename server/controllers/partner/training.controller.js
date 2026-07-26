import { z } from 'zod';
import DeliveryPartner from '../../models/DeliveryPartner.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getTrainingStatus, updateProgress, completeModule, MAX_QUIZ_SCORE } from '../../services/training.service.js';

// Training is reachable only after verification approval, matching RootNavigator.jsx's own
// encoded order exactly: OnboardingStatus (VerificationStatus.jsx) comes before OnboardingTraining
// in the onboarding stack, and VerificationStatus.jsx's own continue-to-training action only
// fires after approveVerification() — approval gates training, not the other way around.
// Enforced here too, not just left to the client's navigation order.
const assertApprovedForTraining = (partner) => {
  if (partner.verificationStatus !== 'approved') {
    throw new ApiError(403, 'NOT_APPROVED', 'Complete verification before starting training');
  }
};

export const getStatus = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findById(req.partner._id);
  if (!partner) throw new ApiError(404, 'NOT_FOUND', 'Delivery partner not found');
  assertApprovedForTraining(partner);

  sendSuccess(res, 200, 'Training status', getTrainingStatus(partner));
});

const progressSchema = z.object({
  moduleId: z.string().min(1),
  watchedSeconds: z.number().min(0),
});

export const patchProgress = asyncHandler(async (req, res) => {
  const result = progressSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid training progress', result.error.flatten());
  }

  const partner = await DeliveryPartner.findById(req.partner._id);
  if (!partner) throw new ApiError(404, 'NOT_FOUND', 'Delivery partner not found');
  assertApprovedForTraining(partner);

  const status = await updateProgress(partner, result.data);
  sendSuccess(res, 200, 'Training progress updated', status);
});

const completeSchema = z.object({ quizScore: z.number().min(0).max(MAX_QUIZ_SCORE) });

export const postComplete = asyncHandler(async (req, res) => {
  const result = completeSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid quiz score', result.error.flatten());
  }

  const partner = await DeliveryPartner.findById(req.partner._id);
  if (!partner) throw new ApiError(404, 'NOT_FOUND', 'Delivery partner not found');
  assertApprovedForTraining(partner);

  const status = await completeModule(partner, {
    moduleId: req.params.moduleId,
    quizScore: result.data.quizScore,
  });
  sendSuccess(res, 200, 'Module completed', status);
});
