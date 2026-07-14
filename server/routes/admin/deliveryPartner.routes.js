import { Router } from 'express';
import { uploadDocuments } from '../../middleware/uploadDocuments.js';
import {
  list,
  getOne,
  create,
  update,
  remove,
  getOrders,
  getPayouts,
  adjustPayout,
  markPayoutsPaid,
  payoutSummary,
} from '../../controllers/admin/deliveryPartner.controller.js';

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
router.get('/payouts/summary', payoutSummary);
router.post('/payouts/mark-paid', markPayoutsPaid);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);
router.get('/:id/orders', getOrders);
router.get('/:id/payouts', getPayouts);
router.patch('/:id/payouts/:payoutId', adjustPayout);

export default router;
