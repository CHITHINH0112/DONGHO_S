import { UserAddress } from '../models/index.js';
import { isValidVietnamPhone, normalizeVietnamPhone } from '../utils/phoneValidator.js';

export const getAddressesByUser = async (userId) => {
  return await UserAddress.findAll({
    where: { userId },
    order: [['isDefault', 'DESC'], ['id', 'DESC']],
  });
};

export const createAddress = async (userId, data) => {
  if (data.phone) {
    if (!isValidVietnamPhone(data.phone)) {
      const error = new Error('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại thật của Việt Nam (10 chữ số, ví dụ: 0987654321).');
      error.statusCode = 400;
      throw error;
    }
    data.phone = normalizeVietnamPhone(data.phone);
  }

  if (data.isDefault) {
    // Nếu địa chỉ này là mặc định, reset các địa chỉ cũ về false
    await UserAddress.update({ isDefault: false }, { where: { userId } });
  }
  return await UserAddress.create({ ...data, userId });
};

export const updateAddress = async (id, userId, data) => {
  const address = await UserAddress.findOne({ where: { id, userId } });
  if (!address) return null;

  if (data.phone) {
    if (!isValidVietnamPhone(data.phone)) {
      const error = new Error('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại thật của Việt Nam (10 chữ số, ví dụ: 0987654321).');
      error.statusCode = 400;
      throw error;
    }
    data.phone = normalizeVietnamPhone(data.phone);
  }

  if (data.isDefault) {
    await UserAddress.update({ isDefault: false }, { where: { userId } });
  }

  await address.update(data);
  return address;
};

export const deleteAddress = async (id, userId) => {
  const address = await UserAddress.findOne({ where: { id, userId } });
  if (!address) return null;
  await address.destroy();
  return true;
};

export default {
  getAddressesByUser,
  createAddress,
  updateAddress,
  deleteAddress,
};
