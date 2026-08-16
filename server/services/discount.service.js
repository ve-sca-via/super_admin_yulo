import MenuItem from '../models/MenuItem.js';
import { ApiError } from '../utils/ApiError.js';

// Shared by billing.service.js's dine-in bill discount application and the customer
// cart's apply-promo (services/cart.service.js) — the same active/date-range/
// minimum-order/applicable-to checks in exactly one place, not duplicated per call site.
export const validateDiscountForOrder = (discount, { subtotal, orderType }) => {
  if (!discount || discount.status !== 'active') {
    throw new ApiError(404, 'NOT_FOUND', 'Discount code not found or inactive');
  }

  const now = new Date();
  if (now < discount.startDate || now > discount.endDate) {
    throw new ApiError(400, 'DISCOUNT_EXPIRED', 'This offer has expired');
  }

  if (subtotal < discount.minimumOrderValue) {
    throw new ApiError(
      400,
      'DISCOUNT_MIN_VALUE',
      `Minimum order value is ₹${discount.minimumOrderValue}`
    );
  }

  // billing.service.js never checked this before — a delivery-only discount could be
  // applied to a dine-in bill. Adding it here is a correctness fix, not just a
  // cart-specific addition: it matches what `applicableTo` was already declared for.
  if (orderType && discount.applicableTo !== 'both' && discount.applicableTo !== orderType) {
    throw new ApiError(
      400,
      'DISCOUNT_NOT_APPLICABLE',
      `This offer only applies to ${discount.applicableTo.replace('_', '-')} orders`
    );
  }
};

export const computeDiscountAmount = async (discount, subtotal) => {
  if (discount.type === 'percentage') return subtotal * (discount.percentage / 100);
  if (discount.type === 'flat_amount') return discount.flatAmount;
  if (discount.type === 'tablewise') return discount.flatAmount;
  if (discount.type === 'free_item') {
    const freeItem = await MenuItem.findById(discount.freeItemId).lean();
    return freeItem?.sellingPrice ?? 0;
  }
  return 0;
};
