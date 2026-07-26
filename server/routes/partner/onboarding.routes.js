import { Router } from 'express';
import {
  updatePersonal,
  updateVehicle,
  updateBank,
  uploadOnboardingDocuments,
  submitForReview,
  getStatus,
} from '../../controllers/partner/onboarding.controller.js';
import { authenticatePartner } from '../../middleware/authenticatePartner.js';
import { uploadDocuments } from '../../middleware/uploadDocuments.js';

const router = Router();

const partnerDocumentFields = [
  { name: 'aadharCard', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'vehicleRc', maxCount: 1 },
  { name: 'insuranceDocument', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 },
];

router.use(authenticatePartner);

router.patch('/personal', updatePersonal);
router.patch('/vehicle', updateVehicle);
router.patch('/bank', updateBank);
router.post('/documents', uploadDocuments(partnerDocumentFields), uploadOnboardingDocuments);
router.post('/submit', submitForReview);
router.get('/status', getStatus);

export default router;
