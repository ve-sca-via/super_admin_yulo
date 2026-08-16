import * as checkoutService from '../services/checkout.service.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await checkoutService.getCheckoutSummary(req.user._id);
  sendSuccess(res, 200, 'Checkout summary', summary);
});
