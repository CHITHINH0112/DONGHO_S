import { User, UserAddress } from '../models/index.js';

/**
 * Lấy toàn bộ danh sách khách hàng kèm địa chỉ giao hàng
 */
export const getAllUserServices = async () => {
  return await User.findAll({
    attributes: { exclude: ['password'] },
    include: [
      {
        model: UserAddress,
        as: 'addresses',
      },
    ],
    order: [['id', 'DESC']],
  });
};

/**
 * Cập nhật trạng thái người dùng (active / inactive / banned)
 */
export const updateUserStatus = async (id, status) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.update({ status });
  return user;
};
