import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const WarrantyClaim = sequelize.define('WarrantyClaim', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  serialNumberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'serial_number_id',
    comment: 'Mã định danh chiếc đồng hồ vật lý (bảng serial_numbers)',
  },
  warrantyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'warranty_id',
    comment: 'Phiếu bảo hành áp dụng',
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'service_id',
    comment: 'Hạng mục bảo hành (lấy từ watch_services có is_warranty_eligible = 1)',
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'customer_id',
    comment: 'Khách hàng mang máy đến (bảng users)',
  },
  staffId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'staff_id',
    comment: 'Nhân viên cửa hàng tiếp nhận (bảng admins)',
  },
  issueDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'issue_description',
    comment: 'Mô tả lỗi hỏng của đồng hồ',
  },
  status: {
    type: DataTypes.ENUM('received', 'processing', 'resolved', 'returned', 'cancelled'),
    allowNull: false,
    defaultValue: 'received',
    comment: 'Trạng thái xử lý bảo hành',
  },
  thoiDiemBaoHanh: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'Thoi_Diem_Bao_Hanh',
    comment: 'Thời điểm nhận máy',
  },
  ngayDuKienTraMay: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'Ngay_Du_Kien_Tra_May',
    comment: 'Ngày hẹn trả máy cho khách',
  },
  returnedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'returned_date',
    comment: 'Ngày thực tế giao lại máy',
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ghi chú của thợ kỹ thuật',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  tableName: 'warranty_claims',
  timestamps: false,
});

export default WarrantyClaim;
