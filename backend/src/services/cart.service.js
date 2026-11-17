import {
  Cart,
  CartItem,
  ProductVariant,
  Product,
  ProductVariantImage,
  SerialNumber,
} from '../models/index.js';

export const getOrCreateCart = async (userId) => {
  const [cart] = await Cart.findOrCreate({
    where: { userId },
  });

  const fullCart = await Cart.findByPk(cart.id, {
    include: [
      {
        model: CartItem,
        as: 'items',
        include: [
          {
            model: ProductVariant,
            as: 'variant',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'slug', 'basePrice', 'imageUrl'],
                include: [
                  {
                    model: ProductVariant,
                    as: 'variants',
                    where: { status: 'active' },
                    required: false,
                    include: [
                      {
                        model: ProductVariantImage,
                        as: 'images',
                      },
                      {
                        model: SerialNumber,
                        as: 'serialNumbers',
                        attributes: ['id', 'status'],
                      },
                    ],
                  },
                ],
              },
              {
                model: ProductVariantImage,
                as: 'images',
              },
              {
                model: SerialNumber,
                as: 'serialNumbers',
                attributes: ['id', 'status'],
              },
            ],
          },
        ],
      },
    ],
  });

  // Tính toán tổng tiền
  let totalAmount = 0;
  let totalQuantity = 0;

  if (fullCart && fullCart.items) {
    fullCart.items.forEach((item) => {
      const price = Number(item.variant?.price || 0);
      totalAmount += price * item.quantity;
      totalQuantity += item.quantity;
    });
  }

  return {
    cart: fullCart,
    totalQuantity,
    totalAmount,
  };
};

export const addItemToCart = async (userId, variantId, quantity = 1) => {
  const [cart] = await Cart.findOrCreate({ where: { userId } });

  const variant = await ProductVariant.findByPk(variantId, {
    include: [{ model: SerialNumber, as: 'serialNumbers', attributes: ['id', 'status'] }],
  });
  if (!variant || variant.status !== 'active') {
    const error = new Error('Biến thể sản phẩm không tồn tại hoặc đã ngừng bán');
    error.statusCode = 400;
    throw error;
  }

  // Đếm tồn kho khả dụng nếu có quản lý serial
  const availableStock = variant.serialNumbers && variant.serialNumbers.length > 0
    ? variant.serialNumbers.filter(s => s.status === 'available').length
    : 99;

  let cartItem = await CartItem.findOne({
    where: {
      cartId: cart.id,
      variantId,
    },
  });

  const currentQty = cartItem ? cartItem.quantity : 0;
  const targetQty = currentQty + Number(quantity);

  if (availableStock > 0 && targetQty > availableStock) {
    const error = new Error(`Kho chỉ còn ${availableStock} sản phẩm khả dụng cho phiên bản này`);
    error.statusCode = 400;
    throw error;
  }

  if (cartItem) {
    cartItem.quantity = targetQty;
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({
      cartId: cart.id,
      variantId,
      quantity: Number(quantity),
    });
  }

  return await getOrCreateCart(userId);
};

export const updateCartItem = async (userId, itemId, { quantity, variantId } = {}) => {
  const [cart] = await Cart.findOrCreate({ where: { userId } });

  const cartItem = await CartItem.findOne({
    where: { id: itemId, cartId: cart.id },
    include: [{
      model: ProductVariant,
      as: 'variant',
      include: [{ model: SerialNumber, as: 'serialNumbers', attributes: ['id', 'status'] }],
    }],
  });

  if (!cartItem) {
    const error = new Error('Không tìm thấy sản phẩm trong giỏ hàng');
    error.statusCode = 404;
    throw error;
  }

  // Nếu có đổi biến thể
  if (variantId && Number(variantId) !== Number(cartItem.variantId)) {
    const newVariant = await ProductVariant.findByPk(variantId, {
      include: [{ model: SerialNumber, as: 'serialNumbers', attributes: ['id', 'status'] }],
    });
    if (!newVariant || newVariant.status !== 'active') {
      const error = new Error('Biến thể sản phẩm mới không tồn tại hoặc đã ngừng bán');
      error.statusCode = 400;
      throw error;
    }

    const availableStock = newVariant.serialNumbers && newVariant.serialNumbers.length > 0
      ? newVariant.serialNumbers.filter(s => s.status === 'available').length
      : 99;

    const targetQty = quantity !== undefined ? Number(quantity) : cartItem.quantity;
    if (availableStock > 0 && targetQty > availableStock) {
      const error = new Error(`Kho chỉ còn ${availableStock} sản phẩm khả dụng cho phiên bản mới này`);
      error.statusCode = 400;
      throw error;
    }

    // Kiểm tra xem giỏ hàng đã có item với variant này chưa
    const existingSameVariantItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        variantId: Number(variantId),
      },
    });

    if (existingSameVariantItem && existingSameVariantItem.id !== cartItem.id) {
      const mergedQty = existingSameVariantItem.quantity + targetQty;
      if (availableStock > 0 && mergedQty > availableStock) {
        const error = new Error(`Tổng số lượng sau khi đổi vượt quá tồn kho khả dụng (${availableStock})`);
        error.statusCode = 400;
        throw error;
      }
      existingSameVariantItem.quantity = mergedQty;
      await existingSameVariantItem.save();
      await cartItem.destroy();
      return await getOrCreateCart(userId);
    }

    cartItem.variantId = Number(variantId);
    if (quantity !== undefined) {
      cartItem.quantity = targetQty;
    }
    await cartItem.save();
    return await getOrCreateCart(userId);
  }

  // Nếu chỉ cập nhật số lượng
  if (quantity !== undefined) {
    const newQty = Number(quantity);
    if (newQty <= 0) {
      await cartItem.destroy();
    } else {
      const availableStock = cartItem.variant?.serialNumbers && cartItem.variant.serialNumbers.length > 0
        ? cartItem.variant.serialNumbers.filter(s => s.status === 'available').length
        : 99;

      if (availableStock > 0 && newQty > availableStock) {
        const error = new Error(`Kho chỉ còn ${availableStock} sản phẩm khả dụng cho phiên bản này`);
        error.statusCode = 400;
        throw error;
      }

      cartItem.quantity = newQty;
      await cartItem.save();
    }
  }

  return await getOrCreateCart(userId);
};

export const updateItemQuantity = async (userId, itemId, quantity) => {
  return await updateCartItem(userId, itemId, { quantity });
};

export const removeCartItem = async (userId, itemId) => {
  const [cart] = await Cart.findOrCreate({ where: { userId } });

  const cartItem = await CartItem.findOne({
    where: { id: itemId, cartId: cart.id },
  });

  if (!cartItem) {
    const error = new Error('Không tìm thấy sản phẩm trong giỏ hàng');
    error.statusCode = 404;
    throw error;
  }

  await cartItem.destroy();
  return await getOrCreateCart(userId);
};

export const clearCart = async (userId) => {
  const cart = await Cart.findOne({ where: { userId } });
  if (cart) {
    await CartItem.destroy({ where: { cartId: cart.id } });
  }
  return await getOrCreateCart(userId);
};

export default {
  getOrCreateCart,
  addItemToCart,
  updateCartItem,
  updateItemQuantity,
  removeCartItem,
  clearCart,
};
