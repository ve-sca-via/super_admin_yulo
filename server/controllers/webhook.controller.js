import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import * as paymentService from '../services/payment.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

// req.body is a raw Buffer here, not a parsed object — this route is mounted with
// express.raw() ahead of the global express.json() (see app.js) specifically so the
// signature check below sees the exact bytes Razorpay signed, not a re-serialized copy.
export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body;

  if (!Buffer.isBuffer(rawBody) || !paymentService.verifyWebhookSignature(rawBody.toString('utf8'), signature)) {
    logger.warn('Razorpay webhook signature verification failed');
    throw new ApiError(400, 'INVALID_SIGNATURE', 'Invalid webhook signature');
  }

  const event = JSON.parse(rawBody.toString('utf8'));
  await paymentService.handleWebhookEvent(event);

  // Razorpay requires a 2xx to consider this delivered — anything else triggers
  // automatic retries, including for event types handleWebhookEvent silently ignores.
  sendSuccess(res, 200, 'ok', null);
});
