import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import watchServiceService from '../services/watchService.service.js';

export const getServices = asyncHandler(async (req, res) => {
  const services = await watchServiceService.getAllServices(req.query);
  return successResponse(res, {
    message: 'Lấy bảng giá dịch vụ sửa chữa thành công',
    data: services,
  });
});

export const createService = asyncHandler(async (req, res) => {
  const service = await watchServiceService.createService(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'Thêm mới dịch vụ thành công',
    data: service,
  });
});

export const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const service = await watchServiceService.updateService(id, req.body);

  if (!service) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy dịch vụ ID '${id}'`,
    });
  }

  return successResponse(res, {
    message: 'Cập nhật dịch vụ thành công',
    data: service,
  });
});

export const getRepairTickets = asyncHandler(async (req, res) => {
  const tickets = await watchServiceService.getRepairTickets(req.query, req.user);
  return successResponse(res, {
    message: 'Lấy danh sách phiếu sửa chữa thành công',
    data: tickets,
  });
});

export const createRepairTicket = asyncHandler(async (req, res) => {
  const staffId = req.user?.role === 'staff' || req.user?.role === 'admin' ? req.user.id : null;
  const customerId = req.body.customerId || (req.user?.role === 'customer' ? req.user.id : null);

  const ticket = await watchServiceService.createRepairTicket({
    ...req.body,
    staffId,
    customerId,
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Tạo phiếu sửa chữa đồng hồ thành công',
    data: ticket,
  });
});

export const updateTicketStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await watchServiceService.updateRepairTicketStatus(id, req.body);
  if (!ticket) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy phiếu sửa chữa ID '${id}'`,
    });
  }

  return successResponse(res, {
    message: 'Cập nhật trạng thái sửa chữa thành công',
    data: ticket,
  });
});

export const cancelRepairTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await watchServiceService.cancelRepairTicket(id, req.user);

  return successResponse(res, {
    message: 'Đã hủy lịch hẹn dịch vụ thành công',
    data: ticket,
  });
});

export default {
  getServices,
  createService,
  updateService,
  getRepairTickets,
  createRepairTicket,
  updateTicketStatus,
  cancelRepairTicket,
};
