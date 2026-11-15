import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import * as serialService from '../services/serial.service.js';

/**
 * Tải file mẫu Excel
 */
export const downloadSerialTemplate = asyncHandler(async (req, res) => {
  const buffer = await serialService.generateSerialTemplateBuffer();
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=Template_Nhap_Kho_Serial_BRU_WATCH.xlsx'
  );
  return res.send(buffer);
});

/**
 * Admin tải file Excel chứa SKU và danh sách Seri lên
 */
export const importSerialsFromExcel = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Vui lòng chọn file Excel (.xlsx hoặc .xls) để tải lên.',
    });
  }

  const result = await serialService.importSerialsFromExcel(
    req.file.buffer,
    req.user?.id
  );

  return successResponse(res, {
    statusCode: 201,
    message: `Đã xử lý xong file Excel: Nhập thành công ${result.successCount} số serial (chờ kho kiểm tra), ${result.failedCount} dòng lỗi.`,
    data: result,
  });
});

/**
 * Lấy danh sách số Serial (lọc theo trạng thái, sản phẩm, SKU)
 */
export const getSerialNumbers = asyncHandler(async (req, res) => {
  const result = await serialService.getSerialNumbers(req.query);
  return successResponse(res, {
    message: 'Lấy danh sách số Serial thành công',
    data: {
      serials: result.serials,
      stats: result.stats,
      pagination: result.pagination,
    },
    meta: result.pagination,
  });
});

/**
 * Lấy danh sách hàng đang chờ nhân viên kho kiểm tra
 */
export const getPendingWarehouseChecks = asyncHandler(async (req, res) => {
  const data = await serialService.getPendingWarehouseChecks();
  return successResponse(res, {
    message: 'Lấy danh sách hàng chờ kho kiểm tra thành công',
    data,
  });
});

/**
 * Nhân viên kho xác nhận đối chiếu hàng thực tế -> Chuyển sang available
 */
export const confirmWarehouseSerials = asyncHandler(async (req, res) => {
  const { serialIds } = req.body;
  const result = await serialService.confirmWarehouseSerials(
    serialIds,
    req.user?.id
  );

  return successResponse(res, {
    message: `Kho đã xác nhận kiểm tra thành công ${result.confirmedCount} chiếc đồng hồ. Số serial đã sẵn sàng mở bán!`,
    data: result,
  });
});

/**
 * Nhân viên kho báo cáo phát hiện sai lệch (thiếu hàng / hỏng)
 */
export const reportSerialDiscrepancy = asyncHandler(async (req, res) => {
  const { serialId, status, note } = req.body;
  const result = await serialService.reportSerialDiscrepancy(
    serialId,
    status,
    note,
    req.user?.id
  );

  return successResponse(res, {
    message: 'Đã ghi nhận báo cáo sai lệch lô hàng thành công.',
    data: result,
  });
});

/**
 * Lấy danh sách các cảnh báo sự cố kho (hàng lỗi / thiếu) cho Admin
 */
export const getSerialAlerts = asyncHandler(async (req, res) => {
  const alerts = await serialService.getSerialDiscrepancyAlerts();
  return successResponse(res, {
    message: 'Lấy danh sách cảnh báo sự cố kho thành công',
    data: alerts,
  });
});


