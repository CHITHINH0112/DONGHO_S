import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import adminService from '../services/admin.service.js';

// Nhân viên
export const getStaffList = asyncHandler(async (req, res) => {
  const staff = await adminService.getStaffList();
  return successResponse(res, {
    message: 'Lấy danh sách nhân viên thành công',
    data: staff,
  });
});

export const createStaff = asyncHandler(async (req, res) => {
  const newStaff = await adminService.createStaff(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'Tạo tài khoản nhân viên thành công',
    data: newStaff,
  });
});

export const updateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const staff = await adminService.updateStaff(id, req.body);
  if (!staff) {
    return errorResponse(res, {
      statusCode: 404,
      message: 'Không tìm thấy tài khoản nhân viên',
    });
  }
  return successResponse(res, {
    message: 'Cập nhật tài khoản nhân viên thành công',
    data: staff,
  });
});

// Ca thu ngân
export const openShift = asyncHandler(async (req, res) => {
  const cashierId = req.body.cashierId || req.user.id;
  const openedByAdminId = req.user.id;

  const shift = await adminService.openCashierShift({
    ...req.body,
    cashierId,
    openedByAdminId,
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Mở ca làm việc thu ngân thành công',
    data: shift,
  });
});

export const closeShift = asyncHandler(async (req, res) => {
  const { shiftId } = req.params;
  const { tienPhaiCoKhiChotCa, note } = req.body;

  const shift = await adminService.closeCashierShift(shiftId, {
    tienPhaiCoKhiChotCa,
    note,
  });

  return successResponse(res, {
    message: 'Chốt và kết thúc ca làm việc thành công',
    data: shift,
  });
});

export const getShifts = asyncHandler(async (req, res) => {
  const { cashierId } = req.query;
  const shifts = await adminService.getCashierShifts(cashierId);

  return successResponse(res, {
    message: 'Lấy danh sách ca thu ngân thành công',
    data: shifts,
  });
});

// Phê duyệt
export const createApproval = asyncHandler(async (req, res) => {
  const nguoiYeuCau = req.user.id;
  const request = await adminService.createApprovalRequest({
    ...req.body,
    nguoiYeuCau,
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Tạo phiếu yêu cầu phê duyệt thành công',
    data: request,
  });
});

export const processApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const nguoiPheDuyet = req.user.id;

  const request = await adminService.processApprovalRequest(id, {
    status,
    nguoiPheDuyet,
  });

  if (!request) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy phiếu yêu cầu ID '${id}'`,
    });
  }

  return successResponse(res, {
    message: `Đã xử lý phê duyệt: ${status}`,
    data: request,
  });
});

export const getApprovals = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const requests = await adminService.getApprovalRequests(status);

  return successResponse(res, {
    message: 'Lấy danh sách phiếu phê duyệt thành công',
    data: requests,
  });
});

// Nhật ký kiểm toán
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  const logs = await adminService.getAuditLogs(limit);

  return successResponse(res, {
    message: 'Lấy nhật ký kiểm toán hệ thống thành công',
    data: logs,
  });
});

export default {
  getStaffList,
  createStaff,
  updateStaff,
  openShift,
  closeShift,
  getShifts,
  createApproval,
  processApproval,
  getApprovals,
  getAuditLogs,
};
