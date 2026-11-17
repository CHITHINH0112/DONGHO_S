import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User, Admin } from '../models/index.js';
import { isValidVietnamPhone, normalizeVietnamPhone } from '../utils/phoneValidator.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_luxury_watch_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // Access token ngắn hạn (1 giờ)

const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'super_luxury_watch_refresh_secret_key_2026';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // Refresh token dài hạn (7 ngày)

/**
 * Sinh cặp accessToken và refreshToken
 */
export const generateTokens = (account, userType = 'user') => {
  const payload = {
    id: account.id,
    email: account.email,
    role: account.role || (userType === 'admin' ? 'admin' : 'customer'),
    position: account.position || null,
    userType,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  const refreshPayload = {
    id: account.id,
    email: account.email,
    userType,
    role: payload.role,
    position: payload.position,
    tokenType: 'refresh',
  };

  const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  return {
    accessToken,
    refreshToken,
    token: accessToken, // Tương thích ngược với client cũ
  };
};

/**
 * Đăng ký tài khoản khách hàng mới vào MySQL
 */
export const register = async ({ name, fullName, email, password, phone }) => {
  const displayName = (name || fullName || '').trim();
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedPassword = (password || '').trim();
  const normalizedPhone = phone && phone.trim() ? phone.trim() : null;

  if (!displayName) {
    const error = new Error('Vui lòng nhập họ và tên');
    error.statusCode = 400;
    throw error;
  }

  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    const error = new Error('Email không hợp lệ');
    error.statusCode = 400;
    throw error;
  }

  if (!trimmedPassword || trimmedPassword.length < 6) {
    const error = new Error('Mật khẩu phải có ít nhất 6 ký tự');
    error.statusCode = 400;
    throw error;
  }

  try {
    const existingEmail = await User.findOne({ where: { email: trimmedEmail } });
    if (existingEmail) {
      const error = new Error('Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.');
      error.statusCode = 400;
      throw error;
    }

    if (normalizedPhone) {
      const existingPhone = await User.findOne({ where: { phone: normalizedPhone } });
      if (existingPhone) {
        const error = new Error('Số điện thoại này đã được sử dụng');
        error.statusCode = 400;
        throw error;
      }
    }

    const user = await User.create({
      name: displayName,
      email: trimmedEmail,
      password: trimmedPassword,
      phone: normalizedPhone,
      status: 'active',
    });

    const tokens = generateTokens(user, 'user');
    return { user, ...tokens };
  } catch (dbErr) {
    if (dbErr.statusCode) throw dbErr;

    if (dbErr.name === 'SequelizeUniqueConstraintError') {
      const error = new Error('Email hoặc số điện thoại đã tồn tại trong hệ thống');
      error.statusCode = 400;
      throw error;
    }

    throw dbErr;
  }
};

/**
 * Đăng nhập tài khoản qua CSDL MySQL (Khách hàng hoặc Quản trị viên)
 */
export const login = async ({ email, password }) => {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedPassword = (password || '').trim();

  if (!trimmedEmail || !trimmedPassword) {
    const error = new Error('Vui lòng nhập đầy đủ email và mật khẩu');
    error.statusCode = 400;
    throw error;
  }

  try {
    // 1. Kiểm tra tài khoản Admin / Staff trước
    const admin = await Admin.findOne({ where: { email: trimmedEmail } });
    if (admin) {
      const isMatch = await admin.comparePassword(trimmedPassword);
      if (!isMatch) {
        const error = new Error('Tài khoản hoặc mật khẩu không chính xác');
        error.statusCode = 401;
        throw error;
      }

      if (!admin.isActive) {
        const error = new Error('Tài khoản nhân viên đã bị vô hiệu hóa');
        error.statusCode = 403;
        throw error;
      }

      const tokens = generateTokens(admin, 'admin');
      return {
        account: admin,
        ...tokens,
        role: admin.role,
        position: admin.position,
        userType: 'admin',
      };
    }

    // 2. Kiểm tra tài khoản User (Khách hàng)
    const user = await User.findOne({ where: { email: trimmedEmail } });
    if (!user) {
      const error = new Error('Tài khoản hoặc mật khẩu không chính xác');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(trimmedPassword);
    if (!isMatch) {
      const error = new Error('Tài khoản hoặc mật khẩu không chính xác');
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== 'active') {
      const error = new Error(`Tài khoản đang ở trạng thái '${user.status}'`);
      error.statusCode = 403;
      throw error;
    }

    const tokens = generateTokens(user, 'user');
    return { account: user, ...tokens, role: 'customer', userType: 'user' };
  } catch (dbErr) {
    if (dbErr.statusCode) throw dbErr;
    throw dbErr;
  }
};

/**
 * Xử lý refresh token cho cả Admin và User qua MySQL
 */
export const refreshTokenService = async (refreshTokenString) => {
  if (!refreshTokenString) {
    const error = new Error('Thiếu refresh token');
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshTokenString, JWT_REFRESH_SECRET);
  } catch (err) {
    const error = new Error('Refresh token không hợp lệ hoặc đã hết hạn');
    error.statusCode = 401;
    throw error;
  }

  const { id, userType } = decoded;
  let account = null;

  try {
    if (userType === 'admin') {
      account = await Admin.findByPk(id);
      if (!account) {
        const error = new Error('Không tìm thấy tài khoản quản trị');
        error.statusCode = 404;
        throw error;
      }
      if (!account.isActive) {
        const error = new Error('Tài khoản quản trị đã bị khóa');
        error.statusCode = 403;
        throw error;
      }
    } else {
      account = await User.findByPk(id);
      if (!account) {
        const error = new Error('Không tìm thấy tài khoản người dùng');
        error.statusCode = 404;
        throw error;
      }
      if (account.status !== 'active') {
        const error = new Error('Tài khoản người dùng đã bị khóa');
        error.statusCode = 403;
        throw error;
      }
    }
  } catch (err) {
    if (err.statusCode) throw err;
    throw err;
  }

  const tokens = generateTokens(account, userType);
  return {
    account,
    ...tokens,
    userType,
    role: account.role || (userType === 'admin' ? 'admin' : 'customer'),
    position: account.position || null,
  };
};

/**
 * Lấy hồ sơ tài khoản từ MySQL
 */
export const getProfile = async (userId, userType = 'user') => {
  let account = null;
  try {
    if (userType === 'admin') {
      account = await Admin.findByPk(userId);
    } else {
      account = await User.findByPk(userId);
    }
  } catch (err) {
    const error = new Error('Lỗi truy vấn cơ sở dữ liệu');
    error.statusCode = 500;
    throw error;
  }

  if (!account) {
    const error = new Error('Không tìm thấy thông tin tài khoản');
    error.statusCode = 404;
    throw error;
  }

  return account;
};

/**
 * Đăng nhập hoặc Tự động đăng ký qua Google OAuth
 */
export const googleLogin = async ({ email, name, googleId, avatar, credential, accessToken, idToken }) => {
  let userEmail = (email || '').trim().toLowerCase();
  let userName = (name || '').trim();

  // 1. Nếu có accessToken từ Google OAuth 2.0 flow, gọi Google UserInfo API để lấy thông tin xác thực
  if (accessToken && !userEmail) {
    try {
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (googleRes.ok) {
        const googleUser = await googleRes.json();
        if (googleUser && googleUser.email) {
          userEmail = googleUser.email.toLowerCase();
          userName = userName || googleUser.name || googleUser.given_name || userEmail.split('@')[0];
        }
      }
    } catch (fetchErr) {
      console.warn('[Google UserInfo Fetch Warning]:', fetchErr.message);
    }
  }

  // 2. Giải mã ID Token Google nếu có
  const tokenToDecode = idToken || credential;
  if (tokenToDecode && !userEmail) {
    try {
      const decoded = jwt.decode(tokenToDecode);
      if (decoded && decoded.email) {
        userEmail = decoded.email.toLowerCase();
        userName = userName || decoded.name || decoded.given_name || userEmail.split('@')[0];
      }
    } catch (err) {
      // Bỏ qua lỗi giải mã nếu đã có payload
    }
  }

  if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
    const error = new Error('Địa chỉ email từ Google không hợp lệ hoặc chưa được cấp quyền');
    error.statusCode = 400;
    throw error;
  }

  try {
    let user = await User.findOne({ where: { email: userEmail } });

    if (!user) {
      // Tự động khởi tạo tài khoản thành viên mới từ Google
      user = await User.create({
        name: userName || userEmail.split('@')[0] || 'Quý Khách Google VIP',
        email: userEmail,
        password: null,
        phone: null,
        status: 'active',
      });
    } else {
      if (user.status !== 'active') {
        const error = new Error(`Tài khoản đang ở trạng thái '${user.status}'`);
        error.statusCode = 403;
        throw error;
      }
      // Cập nhật tên nếu trước đó chưa có tên đầy đủ
      if ((!user.name || user.name === user.email.split('@')[0]) && userName) {
        user.name = userName;
        await user.save();
      }
    }

    const tokens = generateTokens(user, 'user');
    return {
      account: user,
      user,
      ...tokens,
      role: 'customer',
      userType: 'user',
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw err;
  }
};

/**
 * Cập nhật thông tin hồ sơ người dùng
 */
export const updateProfile = async (userId, { name, phone }) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  if (name && name.trim()) {
    user.name = name.trim();
  }

  if (phone !== undefined) {
    if (phone && phone.trim()) {
      if (!isValidVietnamPhone(phone)) {
        const error = new Error('Số điện thoại không hợp lệ. Vui lòng nhập đúng số điện thoại thật của Việt Nam (10 chữ số).');
        error.statusCode = 400;
        throw error;
      }
      const normalizedPhone = normalizeVietnamPhone(phone);
      // Kiểm tra trùng SĐT với user khác
      const existingPhone = await User.findOne({
        where: {
          phone: normalizedPhone,
          id: { [Op.ne]: userId },
        },
      });
      if (existingPhone) {
        const error = new Error('Số điện thoại này đã được tài khoản khác sử dụng');
        error.statusCode = 400;
        throw error;
      }
      user.phone = normalizedPhone;
    } else {
      user.phone = null;
    }
  }

  await user.save();
  return user;
};

/**
 * Đổi mật khẩu tài khoản
 */
export const changePassword = async (userId, { oldPassword, newPassword, confirmPassword }) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  // Nếu user đã có mật khẩu (không phải tài khoản chỉ đăng nhập Google)
  if (user.password) {
    if (!oldPassword) {
      const error = new Error('Vui lòng nhập mật khẩu hiện tại');
      error.statusCode = 400;
      throw error;
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      const error = new Error('Mật khẩu hiện tại không chính xác');
      error.statusCode = 400;
      throw error;
    }
  }

  if (!newPassword || newPassword.length < 6) {
    const error = new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    error.statusCode = 400;
    throw error;
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    const error = new Error('Xác nhận mật khẩu mới không trùng khớp');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save(); // hooks beforeUpdate will automatically bcrypt hash it!

  return { message: 'Đổi mật khẩu thành công' };
};

export default {
  register,
  login,
  googleLogin,
  refreshToken: refreshTokenService,
  getProfile,
  updateProfile,
  changePassword,
};
