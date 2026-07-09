import { Router } from 'express';
import { uploadDocuments } from '../../middleware/uploadDocuments.js';
import { list, getOne, create, update, remove } from '../../controllers/admin/deliveryPartner.controller.js';

const router = Router();

const partnerDocumentFields = [
  { name: 'aadharCard', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'vehicleRc', maxCount: 1 },
  { name: 'insuranceDocument', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 },
];

router.get('/', list);
router.post('/', uploadDocuments(partnerDocumentFields), create);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
