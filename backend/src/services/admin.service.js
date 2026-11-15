import {
  Admin,
  CashierShift,
  ApprovalRequest,
  AuditLog,
} from '../models/index.js';

// --- Quản lý nhân sự ---
export const getStaffList = async () => {
  return await Admin.findAll({
    order: [['id', 'ASC']],
  });
};

export const createStaff = async (data) => {
  const payload = { ...data };
  if (payload.password && !payload.passwordHash) {
    payload.passwordHash = payload.password;
    delete payload.password;
  }
  return await Admin.create(payload);
};

export const updateStaff = async (id, data) => {
  const staff = await Admin.findByPk(id);
  if (!staff) return null;
  const payload = { ...data };
  if (payload.password) {
    payload.passwordHash = payload.password;
    delete payload.password;
  }
  await staff.update(payload);
  return staff;
};

// --- Quản lý ca trực thu ngân (Cashier Shifts) ---
export const openCashierShift = async ({
  cashierId,
  openedByAdminId,
  tienMatDemDuocKhiNhanCa,
  previousShiftId = null,
  note = null,
}) => {
  // Kiểm tra xem thu ngân có ca nào đang mở chưa
  const existingShift = await CashierShift.findOne({
    where: { cashierId, status: 'open' },
  });

  if (existingShift) {
    const error = new Error('Thu ngân này hiện đang có một ca làm việc chưa kết thúc');
    error.statusCode = 400;
    throw error;
  }

  const shift = await CashierShift.create({
    cashierId,
    openedByAdminId,
    tienMatDemDuocKhiNhanCa,
    previousShiftId,
    status: 'open',
    openingCashStatus: 'confirmed',
    note,
  });

  return shift;
};

export const closeCashierShift = async (shiftId, { tienPhaiCoKhiChotCa, note = null }) => {
  const shift = await CashierShift.findByPk(shiftId);
  if (!shift || shift.status === 'closed') {
    const error = new Error('Ca làm việc không tồn tại hoặc đã được kết thúc trước đó');
    error.statusCode = 400;
    throw error;
  }

  shift.closedAt = new Date();
  shift.tienPhaiCoKhiChotCa = tienPhaiCoKhiChotCa;
  shift.status = 'closed';
  if (note) shift.note = (shift.note ? shift.note + ' | ' : '') + note;

  await shift.save();
  return shift;
};

export const getCashierShifts = async (cashierId = null) => {
  const where = {};
  if (cashierId) where.cashierId = cashierId;

  return await CashierShift.findAll({
    where,
    order: [['id', 'DESC']],
    include: [
      {
        model: Admin,
        as: 'cashier',
        attributes: ['id', 'staffCode', 'name'],
      },
      {
        model: Admin,
        as: 'opener',
        attributes: ['id', 'staffCode', 'name'],
      },
    ],
  });
};

// --- Quản lý phiếu phê duyệt (Approval Requests) ---
export const createApprovalRequest = async ({
  requestType,
  idBangLienQuan,
  nguoiYeuCau,
  reason,
}) => {
  return await ApprovalRequest.create({
    requestType,
    idBangLienQuan,
    nguoiYeuCau,
    reason,
    status: 'pending',
  });
};

export const processApprovalRequest = async (requestId, { status, nguoiPheDuyet }) => {
  const request = await ApprovalRequest.findByPk(requestId);
  if (!request) return null;

  request.status = status;
  request.nguoiPheDuyet = nguoiPheDuyet;
  request.thoiDiemPheDuyet = new Date();

  await request.save();
  return request;
};

export const getApprovalRequests = async (status = null) => {
  const where = {};
  if (status) where.status = status;

  return await ApprovalRequest.findAll({
    where,
    order: [['id', 'DESC']],
    include: [
      {
        model: Admin,
        as: 'requester',
        attributes: ['id', 'staffCode', 'name'],
      },
      {
        model: Admin,
        as: 'approver',
        attributes: ['id', 'staffCode', 'name'],
      },
    ],
  });
};

// --- Xem Audit Logs ---
export const getAuditLogs = async (limit = 50) => {
  return await AuditLog.findAll({
    limit: Number(limit),
    order: [['id', 'DESC']],
  });
};

export default {
  getStaffList,
  createStaff,
  updateStaff,
  openCashierShift,
  closeCashierShift,
  getCashierShifts,
  createApprovalRequest,
  processApprovalRequest,
  getApprovalRequests,
  getAuditLogs,
};
