import { Router } from 'express';
import { handleRazorpayWebhook } from '../controllers/webhook.controller.js';

const router = Router();

// No authenticate() middleware — Razorpay's servers call this directly, authenticated by
// the signature check inside the handler, not a bearer token.
router.post('/razorpay', handleRazorpayWebhook);

export default router;
