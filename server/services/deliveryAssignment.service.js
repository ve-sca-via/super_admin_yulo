import Order from '../models/Order.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import { maxConcurrentOrdersPerPartner } from '../config/finance.config.js';

// No delivery-partner-facing app exists (and none is planned), so there is no live
// location or accept/reject signal to work from. Ranking is therefore "least-busy
// currently-active partner" rather than "nearest" — see plan doc for why.
const countActiveAssignments = (partnerId) =>
  Order.countDocuments({
    'deliveryAssignment.partnerId': partnerId,
    'deliveryAssignment.status': { $in: ['assigned', 'picked_up'] },
  });

export const autoAssign = async (order) => {
  if (order.type !== 'delivery') return;

  const candidates = await DeliveryPartner.find({ status: 'active' })
    .sort({ rating: -1, totalDeliveries: 1 })
    .lean();

  for (const candidate of candidates) {
    const activeCount = await countActiveAssignments(candidate._id);
    if (activeCount >= maxConcurrentOrdersPerPartner) continue;

    const now = new Date();
    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          'deliveryAssignment.partnerId': candidate._id,
          'deliveryAssignment.status': 'assigned',
          'deliveryAssignment.assignedAt': now,
          'deliveryAssignment.assignedBy': 'auto',
        },
        $push: {
          'deliveryAssignment.history': {
            partnerId: candidate._id,
            assignedAt: now,
            assignedBy: 'auto',
          },
        },
      }
    );

    if (activeCount + 1 >= maxConcurrentOrdersPerPartner) {
      await DeliveryPartner.updateOne({ _id: candidate._id }, { $set: { status: 'busy' } });
    }

    return candidate._id;
  }

  // No eligible partner right now — leave unassigned. Never throw: this must not
  // block the kitchen's own status transition. Visible/reassignable by admin later.
  return null;
};
