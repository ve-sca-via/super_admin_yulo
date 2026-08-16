import Bill from '../models/Bill.js';
import TableSession from '../models/TableSession.js';
import Table from '../models/Table.js';
import Order from '../models/Order.js';
import Discount from '../models/Discount.js';
import Restaurant from '../models/Restaurant.js';
import * as discountService from './discount.service.js';
import { ApiError } from '../utils/ApiError.js';
import { notifyService } from './notify.service.js';

export const assembleBill = async (tableSessionId) => {
  const session = await TableSession.findById(tableSessionId).populate('orders').lean();
  if (!session) throw new ApiError(404, 'NOT_FOUND', 'Session not found');

  const restaurant = await Restaurant.findById(session.restaurantId).lean();

  const batches = session.orders.map((order) => ({
    batchNumber: order.batchNumber,
    orderId: order._id,
    items: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      lineTotal: i.price * i.quantity,
    })),
    batchTotal: order.subtotal,
    placedAt: order.createdAt,
  }));

  const subtotal = batches.reduce((sum, b) => sum + b.batchTotal, 0);
  const gstPercent = restaurant.settings.gstPercent;
  const gstAmount = subtotal * (gstPercent / 100);
  const serviceChargePercent = restaurant.settings.serviceChargePercent;
  const serviceChargeAmount = subtotal * (serviceChargePercent / 100);
  const grandTotal = subtotal + gstAmount + serviceChargeAmount;

  const bill = await Bill.findOneAndUpdate(
    { tableSessionId },
    {
      restaurantId: session.restaurantId,
      tableSessionId,
      batches,
      subtotal,
      gstPercent,
      gstAmount,
      serviceChargePercent,
      serviceChargeAmount,
      grandTotal,
    },
    { upsert: true, new: true }
  );

  notifyService.billUpdated({ ...bill.toObject(), tableId: session.tableId });
  return bill;
};

// Dine-in bills are assembled from a TableSession (assembleBill above); delivery/takeaway
// orders have no session to batch into, so they get their own single-order bill once the
// order reaches a terminal 'delivered' state (see kitchen.service.updateOrderStatus).
export const createOrderBill = async (order) => {
  const restaurant = await Restaurant.findById(order.restaurantId).lean();

  const subtotal = order.subtotal;
  const gstPercent = restaurant.settings.gstPercent;
  const gstAmount = subtotal * (gstPercent / 100);
  const serviceChargePercent = restaurant.settings.serviceChargePercent;
  const serviceChargeAmount = subtotal * (serviceChargePercent / 100);
  const grandTotal = subtotal + gstAmount + serviceChargeAmount;

  const bill = await Bill.create({
    restaurantId: order.restaurantId,
    orderId: order._id,
    batches: [
      {
        batchNumber: order.batchNumber,
        orderId: order._id,
        items: order.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          lineTotal: i.price * i.quantity,
        })),
        batchTotal: subtotal,
        placedAt: order.createdAt,
      },
    ],
    subtotal,
    gstPercent,
    gstAmount,
    serviceChargePercent,
    serviceChargeAmount,
    grandTotal,
    status: 'paid',
    paidAt: new Date(),
    paidBy: order.paymentMethod ?? 'cash',
  });

  return bill;
};

export const applyDiscount = async ({ billId, discountCode, restaurantId }) => {
  const bill = await Bill.findById(billId);
  if (!bill || bill.status !== 'open') {
    throw new ApiError(404, 'NOT_FOUND', 'Bill not found');
  }

  const discount = await Discount.findOne({ code: discountCode, restaurantId });
  // orderType: 'dine_in' — this is a new check (see discount.service.js's comment); a
  // delivery-only discount now correctly gets rejected here instead of silently applying.
  discountService.validateDiscountForOrder(discount, { subtotal: bill.subtotal, orderType: 'dine_in' });

  const deduction = await discountService.computeDiscountAmount(discount, bill.subtotal);

  bill.discountsApplied.push({
    discountId: discount._id,
    code: discount.code,
    description: discount.offerName,
    amount: deduction,
  });

  bill.grandTotal =
    bill.subtotal +
    bill.gstAmount +
    bill.serviceChargeAmount -
    bill.discountsApplied.reduce((s, d) => s + d.amount, 0);

  await bill.save();
  return bill;
};

export const markPaid = async ({ billId, restaurantId, paymentMethod }) => {
  const bill = await Bill.findOne({ _id: billId, restaurantId, status: 'open' });
  if (!bill) throw new ApiError(404, 'NOT_FOUND', 'Bill not found or already settled');

  const now = new Date();
  bill.status = 'paid';
  bill.paidAt = now;
  bill.paidBy = paymentMethod;
  await bill.save();

  const [session] = await Promise.all([
    TableSession.findByIdAndUpdate(
      bill.tableSessionId,
      { status: 'paid', closedAt: now },
      { new: false }
    ),
    Order.updateMany(
      { tableSessionId: bill.tableSessionId, paymentStatus: 'pending' },
      { $set: { paymentStatus: 'paid', paymentMethod } }
    ),
  ]);

  if (session?.tableId) {
    const table = await Table.findById(session.tableId).lean();
    if (table) notifyService.tableStatusChanged(restaurantId, table, 'paid');
  }

  return bill;
};
