import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import authService from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const { name, fullName, email, password, phone } = req.body;
  const result = await authService.register({ name, fullName, email, password, phone });

  return successResponse(res, {
    statusCode: 201,
    message: 'Đăng ký tài khoản thành công',
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  return successResponse(res, {
    message: 'Đăng nhập thành công',
    data: result,
  });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { email, name, googleId, avatar, credential, accessToken, idToken } = req.body;
  const result = await authService.googleLogin({ email, name, googleId, avatar, credential, accessToken, idToken });

  return successResponse(res, {
    message: 'Đăng nhập Google thành công',
    data: result,
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const result = await authService.refreshToken(token);

  return successResponse(res, {
    message: 'Cấp mới token thành công',
    data: result,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const account = await authService.getProfile(req.user.id, req.userType);

  return successResponse(res, {
    message: 'Lấy thông tin tài khoản thành công',
    data: account,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, phone } = req.body;
  const updatedUser = await authService.updateProfile(userId, { name, phone });

  return successResponse(res, {
    message: 'Cập nhật hồ sơ cá nhân thành công',
    data: updatedUser,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const result = await authService.changePassword(userId, { oldPassword, newPassword, confirmPassword });

  return successResponse(res, {
    message: result.message,
    data: null,
  });
});

export default {
  register,
  login,
  googleLogin,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
};
