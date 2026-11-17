import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const OrderReturn = sequelize.define('OrderReturn', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_id',
  },
  returnType: {
    type: DataTypes.ENUM('refund', 'exchange'),
    allowNull: false,
    defaultValue: 'exchange',
    field: 'return_type',
    comment: 'refund: Trả hàng hoàn tiền, exchange: Đổi hàng',
  },
  oldSerialNumberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'old_serial_number_id',
    comment: 'Serial đồng hồ cũ khách mang trả',
  },
  newSerialNumberId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'new_serial_number_id',
    comment: 'Serial đồng hồ mới khách đổi sang',
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  phanTramKhauTru: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 20.00,
    field: 'Phan_Tram_Khau_Tru',
    comment: 'Phần trăm khấu trừ máy cũ',
  },
  soTienKhauTruMayCu: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'So_Tien_Khau_Tru_May_Cu',
    comment: 'Số tiền khấu trừ máy cũ',
  },
  soTienSauTruPhi: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'So_Tien_Sau_Tru_Phi',
    comment: 'Số tiền hoàn lại cho khách',
  },
  soTienBuThemNeuCan: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'So_Tien_Bu_Them_Neu_Can',
    comment: 'Số tiền khách bù thêm',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'completed', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
}, {
  tableName: 'order_returns',
  timestamps: false,
});

export default OrderReturn;
