import { errorResponse } from '../utils/apiResponse.js';

/**
 * Middleware bắt lỗi 404 Not Found
 */
export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, {
    statusCode: 404,
    message: `Không tìm thấy tài nguyên: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Middleware xử lý lỗi toàn cục (Global Error Handler)
 */
export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ nội bộ';
  let errors = null;

  // Lỗi xác thực dữ liệu từ Sequelize (Validation Error)
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Dữ liệu đầu vào không hợp lệ';
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Lỗi trùng lặp dữ liệu (Unique Constraint)
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Dữ liệu đã tồn tại trong hệ thống';
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Lỗi ràng buộc khóa ngoại (Foreign Key Constraint)
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Không thể xóa hoặc thay đổi dữ liệu này do đang có các bản ghi khác (đơn hàng, số serial kho, giỏ hàng...) liên kết tới.';
  }

  // Lỗi JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Mã xác thực JWT không hợp lệ';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Mã xác thực JWT đã hết hạn';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error Handler] [${req.method}] ${req.originalUrl} -`, err);
  }

  return errorResponse(res, {
    statusCode,
    message,
    errors: errors || (process.env.NODE_ENV === 'development' ? err.stack : undefined),
  });
};

export default {
  notFoundHandler,
  globalErrorHandler,
};
