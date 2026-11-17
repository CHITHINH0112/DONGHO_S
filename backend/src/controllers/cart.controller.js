import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import cartService from '../services/cart.service.js';

export const getCart = asyncHandler(async (req, res) => {
  const result = await cartService.getOrCreateCart(req.user.id);
  return successResponse(res, {
    message: 'Lấy thông tin giỏ hàng thành công',
    data: result.cart,
    meta: {
      totalQuantity: result.totalQuantity,
      totalAmount: result.totalAmount,
    },
  });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { variantId, quantity = 1 } = req.body;
  const result = await cartService.addItemToCart(req.user.id, variantId, quantity);

  return successResponse(res, {
    message: 'Thêm sản phẩm vào giỏ hàng thành công',
    data: result.cart,
    meta: {
      totalQuantity: result.totalQuantity,
      totalAmount: result.totalAmount,
    },
  });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity, variantId } = req.body;
  const result = await cartService.updateCartItem(req.user.id, itemId, { quantity, variantId });

  return successResponse(res, {
    message: 'Cập nhật sản phẩm trong giỏ hàng thành công',
    data: result.cart,
    meta: {
      totalQuantity: result.totalQuantity,
      totalAmount: result.totalAmount,
    },
  });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const result = await cartService.removeCartItem(req.user.id, itemId);

  return successResponse(res, {
    message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
    data: result.cart,
    meta: {
      totalQuantity: result.totalQuantity,
      totalAmount: result.totalAmount,
    },
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  const result = await cartService.clearCart(req.user.id);

  return successResponse(res, {
    message: 'Đã xóa toàn bộ giỏ hàng',
    data: result.cart,
    meta: {
      totalQuantity: 0,
      totalAmount: 0,
    },
  });
});

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
