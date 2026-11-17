import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import orderService from '../services/order.service.js';

export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  const ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  const result = await orderService.createOrder({
    ...req.body,
    userId,
    ipAddr: typeof ipAddr === 'string' ? ipAddr.split(',')[0].trim() : '127.0.0.1',
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Tạo đơn hàng thành công',
    data: result.order,
    meta: {
      paymentUrl: result.paymentUrl,
    },
  });
});

export const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getOrders(req.query, req.user);
  return successResponse(res, {
    message: 'Lấy danh sách đơn hàng thành công',
    data: result.orders,
    meta: result.pagination,
  });
});

export const getOrderDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await orderService.getOrderById(id, req.user);

  if (!order) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy đơn hàng ID '${id}'`,
    });
  }

  return successResponse(res, {
    message: 'Lấy chi tiết đơn hàng thành công',
    data: order,
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  const updatedOrder = await orderService.updateOrderStatus(id, {
    orderStatus,
    paymentStatus,
  });

  if (!updatedOrder) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy đơn hàng ID '${id}' để cập nhật`,
    });
  }

  return successResponse(res, {
    message: 'Cập nhật trạng thái đơn hàng thành công',
    data: updatedOrder,
  });
});

export const requestOrderReturn = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const returnRecord = await orderService.createOrderReturn({
    ...req.body,
    orderId: id,
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Tạo phiếu yêu cầu đổi/trả đồng hồ thành công',
    data: returnRecord,
  });
});

export const updateShipment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const shipment = await orderService.createOrUpdateShipment(id, req.body);

  return successResponse(res, {
    message: 'Cập nhật thông tin vận chuyển thành công',
    data: shipment,
  });
});

export const retryOrderPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  const result = await orderService.retryOrderPayment(
    id,
    {
      paymentMethod: req.body?.paymentMethod,
      ipAddr: typeof ipAddr === 'string' ? ipAddr.split(',')[0].trim() : '127.0.0.1',
    },
    req.user
  );

  return successResponse(res, {
    message: 'Khởi tạo thanh toán lại thành công',
    data: result.order,
    meta: {
      paymentMethod: result.paymentMethod,
      paymentUrl: result.paymentUrl,
    },
  });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  const cancelledOrder = await orderService.cancelOrder(id, { reason }, req.user);

  return successResponse(res, {
    message: 'Hủy đơn hàng thành công',
    data: cancelledOrder,
  });
});

export default {
  createOrder,
  getOrders,
  getOrderDetail,
  updateOrderStatus,
  requestOrderReturn,
  updateShipment,
  retryOrderPayment,
  cancelOrder,
};
