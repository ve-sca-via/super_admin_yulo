import { Router } from 'express';
import { z } from 'zod';
import {
  requestOtpHandler,
  verifyOtpHandler,
  refresh,
  logout,
} from '../../controllers/partner/auth.controller.js';
import { authenticatePartner } from '../../middleware/authenticatePartner.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

const requestOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
});

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  otp: z.string().length(6, 'Enter the 6-digit code'),
});

router.post('/request-otp', authLimiter, validate(requestOtpSchema), requestOtpHandler);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), verifyOtpHandler);
router.post('/refresh', refresh);
router.post('/logout', authenticatePartner, logout);

export default router;
