import * as cartService from '../services/cart.service.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCart = asyncHandler(async (req, res) => {
  const { cart, bill } = await cartService.getCart(req.user._id);
  sendSuccess(res, 200, 'Cart', { cart, bill });
});

export const addItem = asyncHandler(async (req, res) => {
  const { cart, bill } = await cartService.addItem(req.user._id, req.body);
  sendSuccess(res, 201, 'Item added to cart', { cart, bill });
});

export const updateItem = asyncHandler(async (req, res) => {
  const { cart, bill } = await cartService.updateItemQty(req.user._id, req.params.lineItemId, req.body.qty);
  sendSuccess(res, 200, 'Cart item updated', { cart, bill });
});

export const removeItem = asyncHandler(async (req, res) => {
  const { cart, bill } = await cartService.removeItem(req.user._id, req.params.lineItemId);
  sendSuccess(res, 200, 'Cart item removed', { cart, bill });
});

export const clearCart = asyncHandler(async (req, res) => {
  const { cart, bill } = await cartService.clearCart(req.user._id);
  sendSuccess(res, 200, 'Cart cleared', { cart, bill });
});

export const applyPromo = asyncHandler(async (req, res) => {
  const { cart, bill } = await cartService.applyPromo(req.user._id, req.body.code);
  sendSuccess(res, 200, 'Promo applied', { cart, bill });
});
