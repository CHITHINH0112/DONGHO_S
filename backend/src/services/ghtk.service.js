import { Shipment, Order } from '../models/index.js';

/**
 * Boutique VIP Armored Courier Service
 * Hệ thống chuyển phát chuyên dụng bảo mật cao cấp dành riêng cho đồng hồ xa xỉ
 * Hoạt động độc lập 100%, không phụ thuộc token hay dịch vụ thứ ba.
 */

export const calculateShippingFee = async ({
  province = 'TP. Hồ Chí Minh',
  district = 'Quận 1',
  address = '',
  weight = 500, // gram
  value = 50000000, // VNĐ
}) => {
  const isInternalCity =
    province.toLowerCase().includes('hồ chí minh') ||
    province.toLowerCase().includes('tphcm') ||
    province.toLowerCase().includes('hà nội');

  const southProvinces = [
    'bình dương',
    'đồng nai',
    'bà rịa - vũng tàu',
    'long an',
    'tiền giang',
    'bến tre',
    'cần thơ',
    'tây ninh',
  ];
  const isSouthRegion = southProvinces.some((p) => province.toLowerCase().includes(p));

  let fee = 30000;
  let estimatedTime = 'Hỏa tốc 24H (Chuyên viên hộ tống)';
  let deliveryType = 'Boutique Armored VIP Express';

  if (isInternalCity) {
    fee = 30000;
    estimatedTime = 'Hỏa tốc trong ngày (Chuyên viên hộ tống)';
    deliveryType = 'Boutique VIP Hỏa Tốc Nội Thành';
  } else if (isSouthRegion) {
    fee = 45000;
    estimatedTime = '1 - 2 ngày làm việc (Xe chuyên dụng)';
    deliveryType = 'Boutique VIP Chuyên Dụng Nội Miền';
  } else {
    fee = 60000;
    estimatedTime = '1 - 2 ngày làm việc (Đường bay an ninh cao)';
    deliveryType = 'Boutique VIP An Ninh Hàng Không';
  }

  // Miễn phí vận chuyển cho các đơn hàng đồng hồ cao cấp từ 50.000.000 VNĐ
  const isComplimentary = Number(value) >= 50000000;

  return {
    success: true,
    carrier: 'Boutique VIP Armored Courier',
    fee: isComplimentary ? 0 : fee,
    original_fee: fee,
    is_complimentary: isComplimentary,
    insurance_fee: 0, // Miễn phí bảo hiểm 100% giá trị cỗ máy
    delivery_type: deliveryType,
    estimated_deliver_time: estimatedTime,
  };
};

export const createShippingOrder = async ({ orderId, address, receiverName, phone, note = '' }) => {
  const trackingCode = `BW-LUX-${orderId}-${Math.floor(10000 + Math.random() * 90000)}`;

  // Lưu vào bảng shipments trong MySQL
  const [shipment] = await Shipment.upsert({
    orderId,
    tenHangGiao: 'Boutique VIP Armored Courier',
    trackingCode,
    shippingFee: 0,
    codAmount: 0,
    status: 'ready_to_pick',
    shippingAddressJson: {
      receiverName,
      phone,
      address,
    },
    note: note || 'Hàng xa xỉ giá trị cao - Chuyên viên vận chuyển niêm phong an ninh',
  });

  return {
    shipment,
    trackingCode,
    carrier: 'Boutique VIP Armored Courier',
  };
};

export const getTrackingTimeline = async (trackingCode, currentOrderStatus = 'pending') => {
  const now = new Date();
  const formatTime = (d) =>
    `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')} - ${d.getDate().toString().padStart(2, '0')}/${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;

  const t1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const t2 = new Date(now.getTime() - 16 * 60 * 60 * 1000);
  const t3 = new Date(now.getTime() - 6 * 60 * 60 * 1000);

  const timeline = [
    {
      step: 1,
      title: 'Tiếp Nhận Đơn Hàng & Hồ Sơ Chế Tác',
      description: 'Hệ thống BRU_WATCH Boutique đã ghi nhận đơn đặt hàng của Quý khách.',
      time: formatTime(t1),
      status: 'completed',
    },
    {
      step: 2,
      title: 'Kiểm Định Calibre & Chứng Thực Geneva Seal',
      description: 'Nghệ nhân đồng hồ thực hiện quy trình kiểm tra sai số Chronometer và cấp thẻ bảo hành.',
      time: formatTime(t2),
      status: currentOrderStatus === 'pending' ? 'in_progress' : 'completed',
    },
    {
      step: 3,
      title: 'Đóng Hòm Bảo Mật & Niêm Phong Sáp Vàng',
      description: 'Kiệt tác được đặt trong hòm gỗ sồi bọc da cao cấp, niêm phong an ninh trước khi xuất xưởng.',
      time: formatTime(t3),
      status: ['shipping', 'completed'].includes(currentOrderStatus) ? 'completed' : 'pending',
    },
    {
      step: 4,
      title: 'Boutique Armored Courier Vận Chuyển An Ninh',
      description: 'Chuyên viên hộ tống an ninh đang trực tiếp vận chuyển kiệt tác đến tư gia Quý khách.',
      time: 'Dự kiến hôm nay',
      status: currentOrderStatus === 'shipping' ? 'in_progress' : currentOrderStatus === 'completed' ? 'completed' : 'pending',
    },
    {
      step: 5,
      title: 'Bàn Giao Tận Tay & Thử Lên Cổ Tay',
      description: 'Quý khách nghiệm thu giấy tờ xuất xưởng, số Serial Number và thử đồng hồ trên tay.',
      time: currentOrderStatus === 'completed' ? formatTime(now) : 'Chờ hoàn tất',
      status: currentOrderStatus === 'completed' ? 'completed' : 'pending',
    },
  ];

  return {
    carrier: 'Boutique VIP Armored Courier',
    trackingCode,
    timeline,
  };
};

export default {
  calculateShippingFee,
  createShippingOrder,
  getTrackingTimeline,
};

