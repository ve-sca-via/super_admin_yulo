import crypto from 'crypto';
import Order from '../models/Order.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

const hmacHex = (payload, secret) => crypto.createHmac('sha256', secret).update(payload).digest('hex');

const timingSafeEqualHex = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

// Razorpay's documented client-side verification scheme: HMAC-SHA256 of
// "<order_id>|<payment_id>" using RAZORPAY_KEY_SECRET, compared against what the client
// (which got it straight from Razorpay's Checkout SDK) submitted. Implemented directly
// via Node's crypto rather than reaching into the `razorpay` npm package's own
// verification helper, which isn't part of its documented public API surface.
export const verifyOrderPayment = async (
  order,
  { razorpay_payment_id, razorpay_order_id, razorpay_signature }
) => {
  if (!env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(500, 'INTERNAL_ERROR', 'Payment verification is not configured');
  }
  // order.paymentIntentId was stamped when the Razorpay order was created
  // (controllers/order.controller.js's createRazorpayOrderIfNeeded) — this confirms the
  // payment being verified actually belongs to THIS order, not just any valid signature
  // for a payment made against a different one.
  if (!order.paymentIntentId || order.paymentIntentId !== razorpay_order_id) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'This payment does not belong to this order');
  }

  const expected = hmacHex(`${razorpay_order_id}|${razorpay_payment_id}`, env.RAZORPAY_KEY_SECRET);
  const valid = timingSafeEqualHex(expected, razorpay_signature);

  order.paymentStatus = valid ? 'paid' : 'failed';
  if (valid) order.razorpayPaymentId = razorpay_payment_id;
  await order.save();

  if (!valid) {
    throw new ApiError(400, 'PAYMENT_VERIFICATION_FAILED', 'Payment signature verification failed');
  }
  return order;
};

// Webhook signature is a SEPARATE scheme from the client-side one above: HMAC-SHA256 of
// the raw request body using RAZORPAY_WEBHOOK_SECRET (a distinct secret from the key
// secret), sent in the X-Razorpay-Signature header. Needs the exact raw bytes, not a
// re-serialized JSON object — see app.js for why this route gets express.raw() instead
// of the global express.json().
export const verifyWebhookSignature = (rawBody, signature) => {
  if (!env.RAZORPAY_WEBHOOK_SECRET || !signature) return false;
  const expected = hmacHex(rawBody, env.RAZORPAY_WEBHOOK_SECRET);
  return timingSafeEqualHex(expected, signature);
};

// Fallback path for when the client-side verify call never arrives (network drop, app
// killed mid-payment) — reaches the same end state (paymentStatus 'paid'/'failed') via
// Razorpay's own server-to-server delivery instead of the customer's device. Idempotent:
// Razorpay retries delivery on anything but a 2xx response, so re-processing the same
// event just re-sets the same status — no double-processing risk.
export const handleWebhookEvent = async (event) => {
  if (!['payment.captured', 'payment.failed'].includes(event?.event)) return;

  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id) return;

  const order = await Order.findOne({ paymentIntentId: payment.order_id });
  if (!order) {
    logger.warn(
      { razorpayOrderId: payment.order_id, event: event.event },
      'Razorpay webhook for unknown order — no matching paymentIntentId'
    );
    return;
  }

  order.paymentStatus = event.event === 'payment.captured' ? 'paid' : 'failed';
  if (event.event === 'payment.captured') order.razorpayPaymentId = payment.id;
  await order.save();
};
