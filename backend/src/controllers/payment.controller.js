import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import vnpayService from '../services/vnpay.service.js';

export const createVNPayUrl = asyncHandler(async (req, res) => {
  const { orderId, amount, bankCode, orderInfo } = req.body;

  if (!orderId || !amount) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'orderId và amount là bắt buộc',
    });
  }

  const ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  const paymentUrl = vnpayService.createPaymentUrl({
    orderId,
    amount,
    bankCode,
    orderInfo: orderInfo || `Thanh toan don hang #${orderId} tai BRU_WATCH`,
    ipAddr: typeof ipAddr === 'string' ? ipAddr.split(',')[0].trim() : '127.0.0.1',
  });

  return successResponse(res, {
    message: 'Tạo URL thanh toán VNPay thành công',
    data: {
      paymentUrl,
    },
  });
});

export const vnpayReturn = asyncHandler(async (req, res) => {
  const result = await vnpayService.verifyReturnUrl(req.query);

  return successResponse(res, {
    message: result.isSuccess ? 'Thanh toán VNPay thành công' : 'Thanh toán thất bại hoặc chữ ký không hợp lệ',
    data: result,
  });
});

export const vnpayIpn = asyncHandler(async (req, res) => {
  const result = await vnpayService.verifyReturnUrl(req.query);
  if (result.isSuccess) {
    return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
  } else {
    return res.status(200).json({ RspCode: '97', Message: 'Invalid Checksum' });
  }
});

export default {
  createVNPayUrl,
  vnpayReturn,
  vnpayIpn,
};

