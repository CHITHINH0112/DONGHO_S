import { Op } from 'sequelize';
import {
  sequelize,
  Order,
  OrderItem,
  ProductVariant,
  ProductVariantImage,
  Product,
  UserAddress,
  User,
  Admin,
  Shipment,
  OrderReturn,
  SerialNumber,
  Cart,
  CartItem,
} from '../models/index.js';
import vnpayService from './vnpay.service.js';
import ghnService from './ghn.service.js';
import emailService from './email.service.js';
import { isValidVietnamPhone, normalizeVietnamPhone } from '../utils/phoneValidator.js';

export const createOrder = async ({
  userId,
  userAddressId,
  receiverName: bodyReceiverName,
  receiverPhone: bodyReceiverPhone,
  shippingAddress: bodyShippingAddress,
  items, // array of { variantId, quantity }
  paymentMethod = 'cod',
  banOnlineHoacOffline = 'online',
  saleStaffId = null,
  shiftId = null,
  shippingFee = 0,
  securityNotes = '',
  ipAddr = '127.0.0.1',
}) => {
  // Xác thực số điện thoại người nhận nếu là đơn hàng trực tuyến
  let checkPhone = bodyReceiverPhone;
  if (!checkPhone && userAddressId) {
    const uAddr = await UserAddress.findByPk(userAddressId);
    checkPhone = uAddr?.phone;
  }
  if (banOnlineHoacOffline === 'online') {
    if (!checkPhone || !isValidVietnamPhone(checkPhone)) {
      const error = new Error(
        'Số điện thoại nhận hàng không hợp lệ. Quý khách vui lòng cung cấp số điện thoại thật của Việt Nam (10 chữ số, ví dụ: 0987654321, 0912345678).'
      );
      error.statusCode = 400;
      throw error;
    }
    bodyReceiverPhone = normalizeVietnamPhone(checkPhone);
  }

  const transaction = await sequelize.transaction();

  try {
    let tongTienBanDau = 0;
    const validatedItems = [];

    // Kiểm tra và tính giá từng sản phẩm
    for (const item of items) {
      const variant = await ProductVariant.findByPk(item.variantId, { transaction });
      if (!variant || variant.status !== 'active') {
        throw new Error(`Biến thể sản phẩm #${item.variantId} không hợp lệ hoặc ngừng bán`);
      }

      const itemPrice = Number(variant.price);
      const quantity = Number(item.quantity) || 1;
      tongTienBanDau += itemPrice * quantity;

      validatedItems.push({
        variantId: variant.id,
        giaSanPhamTaiLucDo: itemPrice,
        quantity,
      });
    }

    const orderCode = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const tongTienDonHang = tongTienBanDau + Number(shippingFee || 0);

    const order = await Order.create(
      {
        orderCode,
        banOnlineHoacOffline,
        userId,
        userAddressId,
        saleStaffId,
        shiftId,
        tongTienBanDau,
        tongTienDonHang,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'paid' : 'unpaid',
        orderStatus: 'pending',
      },
      { transaction }
    );

    // Tạo các chi tiết đơn hàng
    for (const item of validatedItems) {
      await OrderItem.create(
        {
          orderId: order.id,
          variantId: item.variantId,
          giaSanPhamTaiLucDo: item.giaSanPhamTaiLucDo,
          quantity: item.quantity,
        },
        { transaction }
      );
    }

    // Xóa các món đã đặt khỏi giỏ hàng CSDL
    if (userId) {
      const userCart = await Cart.findOne({ where: { userId }, transaction });
      if (userCart) {
        const variantIds = validatedItems.map((vi) => vi.variantId);
        await CartItem.destroy({
          where: {
            cartId: userCart.id,
            variantId: { [Op.in]: variantIds },
          },
          transaction,
        });
      }
    }

    await transaction.commit();

    // Tự động tạo vận đơn Giao Hàng Nhanh (GHN Express) live nếu là bán online
    if (banOnlineHoacOffline === 'online') {
      try {
        const userAddress = userAddressId
          ? await UserAddress.findByPk(userAddressId)
          : null;

        const receiverName = bodyReceiverName || userAddress?.receiverName || 'Khách Hàng Luxury';
        const phone = bodyReceiverPhone || userAddress?.phone || '0964694715';
        const address = bodyShippingAddress || userAddress?.address || '1 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh';

        await ghnService.createGHNOrder({
          orderId: order.id,
          orderCode: order.orderCode,
          address,
          receiverName,
          phone,
          codAmount: paymentMethod === 'cod' ? tongTienDonHang : 0,
          shippingFee: Number(shippingFee || 0),
          weight: 500,
          note: securityNotes || 'Niêm phong bảo mật - Hàng đồng hồ Thụy Sĩ giá trị cao',
        });
      } catch (ghnErr) {
        console.warn('[Order Service] Tự động tạo vận đơn GHN gặp lỗi:', ghnErr.message);
      }
    }

    const createdOrder = await getOrderById(order.id);

    // Tự động gửi email xác nhận đặt hàng Haute Horlogerie (asynchronous, non-blocking)
    if (createdOrder) {
      emailService.sendOrderConfirmationEmail(createdOrder).catch((err) => {
        console.warn(`[Order Service] Lỗi khi gửi email xác nhận đơn hàng #${order.orderCode}:`, err.message);
      });
    }

    // Nếu chọn thanh toán VNPay, tạo paymentUrl
    let paymentUrl = null;
    if (paymentMethod === 'vnpay') {
      paymentUrl = vnpayService.createPaymentUrl({
        orderId: order.id,
        amount: tongTienDonHang,
        orderInfo: `Thanh toan don hang #${order.orderCode} tai BRU_WATCH`,
        ipAddr,
      });
    }

    return {
      order: createdOrder,
      paymentUrl,
    };
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

export const getOrders = async (query = {}, reqUser = null) => {
  const {
    page = 1,
    limit = 20,
    status,
    paymentStatus,
    banOnlineHoacOffline,
    search,
  } = query;

  const where = {};

  // Nếu là khách hàng, chỉ xem đơn của chính mình
  if (reqUser && reqUser.role === 'customer') {
    where.userId = reqUser.id;
  }

  if (status) {
    where.orderStatus = status;
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  if (banOnlineHoacOffline) {
    where.banOnlineHoacOffline = banOnlineHoacOffline;
  }

  if (search) {
    where.orderCode = { [Op.like]: `%${search}%` };
  }

  const offset = (Number(page) - 1) * Number(limit);

  const { count, rows } = await Order.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [['id', 'DESC']],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone'],
      },
      {
        model: UserAddress,
        as: 'address',
      },
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: ProductVariant,
            as: 'variant',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'slug', 'imageUrl'],
              },
              {
                model: ProductVariantImage,
                as: 'images',
              },
            ],
          },
        ],
      },
      {
        model: Shipment,
        as: 'shipment',
      },
    ],
  });

  return {
    orders: rows,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      limit: Number(limit),
    },
  };
};

export const getOrderById = async (orderId, reqUser = null) => {
  const where = { id: orderId };
  if (reqUser && reqUser.role === 'customer') {
    where.userId = reqUser.id;
  }

  const order = await Order.findOne({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone'],
      },
      {
        model: UserAddress,
        as: 'address',
      },
      {
        model: Admin,
        as: 'saleStaff',
        attributes: ['id', 'staffCode', 'name', 'email'],
      },
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: ProductVariant,
            as: 'variant',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'slug', 'imageUrl'],
              },
              {
                model: ProductVariantImage,
                as: 'images',
              },
            ],
          },
          {
            model: SerialNumber,
            as: 'serials',
            attributes: ['id', 'serialNumber', 'status', 'location'],
          },
        ],
      },
      {
        model: Shipment,
        as: 'shipment',
      },
      {
        model: OrderReturn,
        as: 'returns',
      },
    ],
  });

  return order;
};

export const updateOrderStatus = async (orderId, { orderStatus, paymentStatus }) => {
  const order = await Order.findByPk(orderId);
  if (!order) return null;

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  await order.save();
  return order;
};

export const createOrderReturn = async ({
  orderId,
  oldSerialNumberId,
  newSerialNumberId,
  reason,
  phanTramKhauTru = 20.0,
  returnType = 'exchange',
}) => {
  const order = await Order.findByPk(orderId);
  if (!order) {
    const error = new Error('Đơn hàng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  const orderReturn = await OrderReturn.create({
    orderId,
    oldSerialNumberId,
    newSerialNumberId,
    reason,
    phanTramKhauTru,
    returnType,
    status: 'pending',
  });

  return orderReturn;
};

export const createOrUpdateShipment = async (orderId, shipmentData) => {
  const [shipment] = await Shipment.upsert({
    ...shipmentData,
    orderId,
  });
  return shipment;
};

export const retryOrderPayment = async (orderId, { paymentMethod, ipAddr = '127.0.0.1' }, reqUser = null) => {
  const order = await getOrderById(orderId, reqUser);
  if (!order) {
    const error = new Error(`Không tìm thấy đơn hàng ID '${orderId}'`);
    error.statusCode = 404;
    throw error;
  }
  if (order.paymentStatus === 'paid') {
    const error = new Error('Đơn hàng đã được thanh toán thành công, không thể thanh toán lại');
    error.statusCode = 400;
    throw error;
  }

  const chosenMethod = paymentMethod || order.paymentMethod;
  if (chosenMethod !== order.paymentMethod) {
    order.paymentMethod = chosenMethod;
    await order.save();
  }

  let paymentUrl = null;
  if (chosenMethod === 'vnpay') {
    paymentUrl = vnpayService.createPaymentUrl({
      orderId: order.id,
      amount: order.tongTienDonHang,
      orderInfo: `Thanh toan lai don hang luxury ${order.orderCode}`,
      ipAddr,
    });
  }

  return {
    order,
    paymentMethod: chosenMethod,
    paymentUrl,
  };
};

export const cancelOrder = async (orderId, { reason = '' } = {}, reqUser = null) => {
  const where = { id: orderId };
  if (reqUser && reqUser.role === 'customer') {
    where.userId = reqUser.id;
  }

  const order = await Order.findOne({ where });
  if (!order) {
    const error = new Error('Không tìm thấy đơn hàng hoặc Quý khách không có quyền hủy đơn này');
    error.statusCode = 404;
    throw error;
  }

  if (order.orderStatus !== 'pending') {
    const error = new Error(
      `Không thể hủy đơn hàng này vì đơn đã được chuyển sang trạng thái '${order.orderStatus}'. Vui lòng liên hệ Hotline Concierge để được hỗ trợ.`
    );
    error.statusCode = 400;
    throw error;
  }

  order.orderStatus = 'cancelled';
  await order.save();

  // Cập nhật shipment status sang cancelled nếu có
  await Shipment.update({ status: 'cancelled' }, { where: { orderId: order.id } });

  return order;
};

export default {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  createOrderReturn,
  createOrUpdateShipment,
  retryOrderPayment,
  cancelOrder,
};
