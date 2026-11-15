import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { getAllUserServices, updateUserStatus as updateStatusService } from '../services/user.service.js';

/**
 * Controller lấy danh sách toàn bộ người dùng
 */
export const getAllUser = asyncHandler(async (req, res) => {
  const users = await getAllUserServices();
  return successResponse(res, {
    message: 'Lấy danh sách người dùng thành công',
    data: users,
  });
});

/**
 * Controller cập nhật trạng thái người dùng (active / inactive / banned)
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['active', 'inactive', 'banned'].includes(status)) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: active, inactive, banned.',
    });
  }

  const user = await updateStatusService(id, status);
  if (!user) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy người dùng có ID ${id}`,
    });
  }

  return successResponse(res, {
    message: `Đã cập nhật trạng thái người dùng thành: ${status}`,
    data: user,
  });
});
