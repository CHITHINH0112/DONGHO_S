import {
  WatchService,
  RepairTicket,
  SerialNumber,
  User,
  Admin,
} from '../models/index.js';
import emailService from './email.service.js';

export const getAllServices = async (options = {}) => {
  const where = {};
  if (options.all !== 'true' && options.all !== true && options.onlyActive !== false) {
    where.isActive = true;
  }
  return await WatchService.findAll({
    where,
    order: [['basePrice', 'ASC']],
  });
};

export const createService = async (data) => {
  return await WatchService.create(data);
};

export const updateService = async (id, data) => {
  const service = await WatchService.findByPk(id);
  if (!service) return null;
  await service.update(data);
  return service;
};

export const createRepairTicket = async (data) => {
  let serialNumberId = data.serialNumberId || null;

  // Nếu khách gửi chuỗi Serial nhưng chưa có ID, tìm kiếm trong serial_numbers
  if (!serialNumberId && data.serialNumber) {
    const foundSerial = await SerialNumber.findOne({
      where: { serialNumber: String(data.serialNumber).trim() },
    });
    if (foundSerial) {
      serialNumberId = foundSerial.id;
    }
  }

  // Tự động tìm tài khoản khách hàng theo số điện thoại hoặc email nếu chưa có customerId
  let customerId = data.customerId || null;
  if (!customerId && data.customerPhone) {
    const foundByPhone = await User.findOne({ where: { phone: String(data.customerPhone).trim() } });
    if (foundByPhone) customerId = foundByPhone.id;
  }
  if (!customerId && data.customerEmail) {
    const foundByEmail = await User.findOne({ where: { email: String(data.customerEmail).trim() } });
    if (foundByEmail) customerId = foundByEmail.id;
  }

  // Tự động gán chi phí niêm yết từ gói dịch vụ nếu chưa có
  let cost = data.cost;
  const service = await WatchService.findByPk(data.serviceId);
  if (cost === undefined || cost === null) {
    cost = service ? service.basePrice : 0;
  }

  // Ghi chú bổ sung thông tin cỗ máy / hình thức tiếp nhận / địa chỉ tận nơi
  let noteParts = [];
  if (data.watchInfo) noteParts.push(`Cỗ máy: ${data.watchInfo}`);
  if (data.serialNumber && !serialNumberId) noteParts.push(`Serial: ${data.serialNumber}`);
  if (data.locationType === 'home') {
    const addr = data.pickupAddress || 'Tại tư gia khách hàng';
    noteParts.push(`Tiếp nhận tận nơi: ${addr}`);
  } else {
    noteParts.push('Hình thức tiếp nhận: Tại Flagship Boutique (1 Lê Duẩn, Q.1)');
  }
  if (data.customerName) noteParts.push(`Người liên hệ: ${data.customerName} - ${data.customerPhone || ''}`);
  if (data.note) noteParts.push(data.note);

  const combinedNote = noteParts.join(' • ');

  const ticket = await RepairTicket.create({
    serialNumberId,
    customerId,
    staffId: data.staffId || null,
    serviceId: data.serviceId,
    issueDescription: data.issueDescription || 'Bảo dưỡng cỗ máy định kỳ tiêu chuẩn Thụy Sĩ',
    cost,
    paymentStatus: data.paymentStatus || 'unpaid',
    status: 'received',
    receivedDate: new Date(),
    appointmentDate: data.appointmentDate || null,
    note: combinedNote || null,
  });

  // Tải chi tiết phiếu vừa tạo để trả về và gửi email xác nhận
  const fullTicket = await getRepairTicketById(ticket.id);

  // Kích hoạt gửi email xác nhận lịch hẹn (asynchronous, non-blocking)
  if (fullTicket) {
    emailService.sendServiceBookingEmail(fullTicket, data.customerEmail).catch((err) => {
      console.warn(`[WatchService] Lỗi khi gửi email xác nhận lịch hẹn #${ticket.id}:`, err.message);
    });
  }

  return fullTicket || ticket;
};

export const getRepairTicketById = async (id) => {
  return await RepairTicket.findByPk(id, {
    include: [
      {
        model: WatchService,
        as: 'service',
      },
      {
        model: SerialNumber,
        as: 'serialNumber',
      },
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'name', 'phone', 'email'],
      },
      {
        model: Admin,
        as: 'staff',
        attributes: ['id', 'staffCode', 'name'],
      },
    ],
  });
};

export const getRepairTickets = async (query = {}, reqUser = null) => {
  const where = {};
  if (query.status) {
    where.status = query.status;
  }
  if (query.serialNumberId) {
    where.serialNumberId = query.serialNumberId;
  }
  if (reqUser && reqUser.role === 'customer') {
    where.customerId = reqUser.id;
  }

  return await RepairTicket.findAll({
    where,
    order: [['id', 'DESC']],
    include: [
      {
        model: WatchService,
        as: 'service',
      },
      {
        model: SerialNumber,
        as: 'serialNumber',
      },
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'name', 'phone', 'email'],
      },
      {
        model: Admin,
        as: 'staff',
        attributes: ['id', 'staffCode', 'name'],
      },
    ],
  });
};

export const updateRepairTicketStatus = async (id, { status, note, cost, appointmentDate }) => {
  const ticket = await RepairTicket.findByPk(id);
  if (!ticket) return null;

  if (status) ticket.status = status;
  if (note !== undefined) ticket.note = note;
  if (cost !== undefined) ticket.cost = cost;
  if (appointmentDate !== undefined) ticket.appointmentDate = appointmentDate;
  await ticket.save();

  return await getRepairTicketById(ticket.id);
};

export const cancelRepairTicket = async (id, reqUser) => {
  const ticket = await RepairTicket.findByPk(id);
  if (!ticket) {
    const error = new Error(`Không tìm thấy lịch hẹn dịch vụ #${id}`);
    error.statusCode = 404;
    throw error;
  }

  if (reqUser && reqUser.role === 'customer' && ticket.customerId !== reqUser.id) {
    const error = new Error('Quý khách không có quyền thao tác trên lịch hẹn này');
    error.statusCode = 403;
    throw error;
  }

  if (ticket.status !== 'received') {
    const error = new Error('Lịch hẹn đã được tiếp nhận xử lý hoặc đã hoàn tất, không thể tự hủy lúc này');
    error.statusCode = 400;
    throw error;
  }

  ticket.status = 'cancelled';
  await ticket.save();

  return await getRepairTicketById(ticket.id);
};

export default {
  getAllServices,
  createService,
  updateService,
  createRepairTicket,
  getRepairTicketById,
  getRepairTickets,
  updateRepairTicketStatus,
  cancelRepairTicket,
};
