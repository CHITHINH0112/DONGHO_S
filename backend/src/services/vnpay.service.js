import crypto from 'crypto';
import querystring from 'qs';
import { Order } from '../models/index.js';

function sortObject(obj) {
  const sorted = {};
  const str = [];
  let key;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[decodeURIComponent(str[key])]).replace(/%20/g, '+');
  }
  return sorted;
}

export const createPaymentUrl = ({
  orderId,
  amount,
  orderInfo = 'Thanh toan don hang dong ho luxury',
  ipAddr = '127.0.0.1',
  bankCode = '',
}) => {
  const tmnCode = process.env.VNP_TMN_CODE || '2QXUI4J4';
  const secretKey = process.env.VNP_HASH_SECRET || 'RAHGSWHCWYXPZGWWPTGVRQOEBETVKSWE';
  let vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:3000/checkout/success';

  const date = new Date();
  const createDate =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0') +
    date.getHours().toString().padStart(2, '0') +
    date.getMinutes().toString().padStart(2, '0') +
    date.getSeconds().toString().padStart(2, '0');

  const locale = 'vn';
  const currCode = 'VND';

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = String(orderId);
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = Math.round(Number(amount) * 100);
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;

  if (bankCode && bankCode.trim() !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  return vnpUrl;
};

export const verifyReturnUrl = async (vnp_Params) => {
  const secretKey = process.env.VNP_HASH_SECRET || 'RAHGSWHCWYXPZGWWPTGVRQOEBETVKSWE';
  const secureHash = vnp_Params['vnp_SecureHash'];

  const verifyParams = { ...vnp_Params };
  delete verifyParams['vnp_SecureHash'];
  delete verifyParams['vnp_SecureHashType'];

  const sortedParams = sortObject(verifyParams);
  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const isSuccess = secureHash === signed && vnp_Params['vnp_ResponseCode'] === '00';
  const orderId = vnp_Params['vnp_TxnRef'];

  if (isSuccess && orderId) {
    // Cập nhật trạng thái đơn hàng đã thanh toán thành công
    const order = await Order.findOne({
      where: {
        id: isNaN(Number(orderId)) ? 0 : Number(orderId),
      },
    });

    if (order) {
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      await order.save();
    }
  }

  return {
    isSuccess,
    orderId,
    responseCode: vnp_Params['vnp_ResponseCode'],
    transactionNo: vnp_Params['vnp_TransactionNo'],
    bankCode: vnp_Params['vnp_BankCode'],
    cardType: vnp_Params['vnp_CardType'],
    amount: Number(vnp_Params['vnp_Amount'] || 0) / 100,
  };
};

export default {
  createPaymentUrl,
  verifyReturnUrl,
};

