import jwt from 'jsonwebtoken';
import { User, Admin } from '../models/index.js';
import { errorResponse } from '../utils/apiResponse.js';
const JWT_SECRET = process.env.JWT_SECRET || 'super_luxury_watch_secret_key_2026';
/**
 * Middleware xác thực JWT token (hỗ trợ cả User và Admin/Staff)
 */
export const verifyToken = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Bạn chưa đăng nhập hoặc thiếu token xác thực',
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    let account = null;
    if (decoded.userType === 'admin') {
      try {
        account = await Admin.findByPk(decoded.id);
      } catch (err) {
        account = { id: decoded.id, email: decoded.email, role: decoded.role, position: decoded.position, isActive: true };
      }
      if (!account) {
        account = { id: decoded.id, email: decoded.email, role: decoded.role, position: decoded.position, isActive: true };
      }
      if (!account.isActive) {
        return errorResponse(res, {
          statusCode: 401,
          message: 'Tài khoản nhân viên không tồn tại hoặc đã bị khóa',
        });
      }
    } else {
      try {
        account = await User.findByPk(decoded.id);
      } catch (err) {
        account = { id: decoded.id, email: decoded.email, role: decoded.role || 'customer', status: 'active' };
      }
      if (!account) {
        account = { id: decoded.id, email: decoded.email, role: decoded.role || 'customer', status: 'active' };
      }
      if (account.status !== 'active') {
        return errorResponse(res, {
          statusCode: 401,
          message: 'Tài khoản khách hàng không tồn tại hoặc đã bị khóa',
        });
      }
    }
    req.user = account;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware kiểm tra quyền Role: 'admin', 'staff', 'customer'
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Bạn không có quyền thực hiện thao tác này (Role không phù hợp)',
      });
    }
    next();
  };
};

/**
 * Middleware kiểm tra Chức vụ nhân viên: 'manager', 'sales', 'warehouse', 'technician'
 */
export const authorizePositions = (...positions) => {
  return (req, res, next) => {
    // Admin cấp manager luôn có quyền tối cao
    if (req.user?.role === 'admin' || req.user?.position === 'manager') {
      return next();
    }

    if (!req.user || !positions.includes(req.user.position)) {
      return errorResponse(res, {
        statusCode: 403,
        message: `Thao tác yêu cầu chức vụ: ${positions.join(', ')}`,
      });
    }
    next();
  };
};

export default {
  verifyToken,
  authorizeRoles,
  authorizePositions,
};
