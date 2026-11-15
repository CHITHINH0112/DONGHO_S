import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const SerialNumber = sequelize.define('SerialNumber', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  variantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'variant_id',
  },
  serialNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'serial_number',
  },
  status: {
    type: DataTypes.ENUM(
      'pending_approval',
      'pending_warehouse_check',
      'available',
      'missing_on_import',
      'reserved',
      'sold',
      'defective',
      'in_repair',
      'returned_to_warehouse'
    ),
    allowNull: false,
    defaultValue: 'pending_approval',
  },
  itemCondition: {
    type: DataTypes.ENUM('new', 'like_new', 'pre_owned'),
    allowNull: false,
    defaultValue: 'new',
    field: 'item_condition',
  },
  location: {
    type: DataTypes.ENUM('warehouse', 'showroom'),
    allowNull: false,
    defaultValue: 'warehouse',
  },
  importedByAdminId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'imported_by_admin_id',
    comment: 'Admin đẩy danh sách seri lên hệ thống và duyệt',
  },
  adminApprovedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'admin_approved_at',
  },
  warehouseConfirmedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'warehouse_confirmed_by',
    comment: 'Nhân viên kho đối chiếu thực tế và xác nhận',
  },
  warehouseConfirmedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'warehouse_confirmed_at',
  },
  note: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  thoiHanThanhToan: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'Thoi_Han_Thanh_Toan',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
}, {
  tableName: 'serial_numbers',
  timestamps: false,
});

export default SerialNumber;
