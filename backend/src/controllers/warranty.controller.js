import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import warrantyService from '../services/warranty.service.js';

export const checkWarranty = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const warranty = await warrantyService.checkWarranty(code);

  if (!warranty) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy thông tin bảo hành cho mã/serial '${code}'`,
    });
  }

  return successResponse(res, {
    message: 'Tra cứu thông tin bảo hành thành công',
    data: warranty,
  });
});

export const getAllWarranties = asyncHandler(async (req, res) => {
  const list = await warrantyService.getAllWarranties(req.query);
  return successResponse(res, {
    message: 'Lấy danh sách thẻ bảo hành điện tử thành công',
    data: list,
  });
});

export const createWarranty = asyncHandler(async (req, res) => {
  const warranty = await warrantyService.createWarranty(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'Tạo thẻ bảo hành điện tử thành công',
    data: warranty,
  });
});

export const getClaims = asyncHandler(async (req, res) => {
  const claims = await warrantyService.getWarrantyClaims(req.query, req.user);
  return successResponse(res, {
    message: 'Lấy danh sách yêu cầu bảo hành thành công',
    data: claims,
  });
});

export const createClaim = asyncHandler(async (req, res) => {
  const staffId = req.user?.role === 'staff' || req.user?.role === 'admin' ? req.user.id : null;
  const customerId = req.body.customerId || (req.user?.role === 'customer' ? req.user.id : null);

  const claim = await warrantyService.createWarrantyClaim({
    ...req.body,
    staffId,
    customerId,
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Tiếp nhận xử lý bảo hành thành công',
    data: claim,
  });
});

export const updateClaimStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const claim = await warrantyService.updateClaimStatus(id, req.body);

  if (!claim) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy phiếu bảo hành ID '${id}'`,
    });
  }

  return successResponse(res, {
    message: 'Cập nhật tiến độ bảo hành thành công',
    data: claim,
  });
});

export default {
  checkWarranty,
  getAllWarranties,
  createWarranty,
  getClaims,
  createClaim,
  updateClaimStatus,
};
