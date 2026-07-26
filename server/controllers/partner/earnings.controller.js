import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getCashInHand } from '../../services/cashLedger.service.js';
import { getEarningsForPeriod } from '../../services/earnings.service.js';

export const getCashInHandHandler = asyncHandler(async (req, res) => {
  const cashInHand = await getCashInHand(req.partner._id);
  sendSuccess(res, 200, 'Cash in hand', { cashInHand });
});

const VALID_PERIODS = ['today', 'weekly', 'monthly'];

export const getEarningsHandler = asyncHandler(async (req, res) => {
  const { period = 'today' } = req.query;
  if (!VALID_PERIODS.includes(period)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'period must be one of today, weekly, monthly');
  }

  const data = await getEarningsForPeriod(req.partner._id, period);
  sendSuccess(res, 200, 'Earnings', data);
});
