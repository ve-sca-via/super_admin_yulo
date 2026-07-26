import mongoose from 'mongoose';
import Order from '../models/Order.js';
import CashDeposit from '../models/CashDeposit.js';

// Full-ledger computation (total collected minus total confirmed-deposited) rather than a
// literal "orders delivered since the last confirmed deposit" window. CashDeposit.jsx has no
// amount input at all — it only ever offers to deposit the partner's whole current balance — so
// in the flow the app actually drives, the two formulas agree exactly. But the POST /deposits API
// itself accepts an arbitrary client-supplied amount, so a partial deposit is possible at the API
// level even if today's UI never triggers one; the date-windowed version would silently lose
// track of the un-deposited remainder the moment ANY deposit landed. This version stays correct
// either way.
export const getCashInHand = async (partnerId) => {
  const partnerObjectId = new mongoose.Types.ObjectId(partnerId);

  const [collectedAgg, depositedAgg] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          'deliveryAssignment.partnerId': partnerObjectId,
          'deliveryAssignment.status': 'delivered',
          paymentMethod: 'cash',
        },
      },
      { $group: { _id: null, total: { $sum: '$deliveryAssignment.codCollected' } } },
    ]),
    CashDeposit.aggregate([
      { $match: { partnerId: partnerObjectId, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const totalCollected = collectedAgg[0]?.total ?? 0;
  const totalDeposited = depositedAgg[0]?.total ?? 0;
  // Clamp at 0 rather than ever surface a negative balance (e.g. from an over-reported deposit —
  // this flow is entirely self-reported, see the comment on deliverOrder's codDiscrepancy).
  return Math.max(0, totalCollected - totalDeposited);
};
