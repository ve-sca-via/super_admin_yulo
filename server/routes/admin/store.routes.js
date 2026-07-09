import { Router } from 'express';
import {
  list,
  getOne,
  approve,
  reject,
  suspend,
  reactivate,
  update,
  addNote,
  verifyDocument,
  remove,
} from '../../controllers/admin/store.controller.js';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id/approve', approve);
router.patch('/:id/reject', reject);
router.patch('/:id/suspend', suspend);
router.patch('/:id/reactivate', reactivate);
router.patch('/:id', update);
router.post('/:id/notes', addNote);
router.patch('/:id/documents/:docId', verifyDocument);
router.delete('/:id', remove);

export default router;
