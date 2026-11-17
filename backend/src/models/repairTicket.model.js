import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const RepairTicket = sequelize.define('RepairTicket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  serialNumberId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'serial_number_id',
    comment: 'Chiếc đồng hồ nào được mang đi sửa',
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'customer_id',
    comment: 'Khách hàng yêu cầu sửa chữa (nếu có)',
  },
  staffId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'staff_id',
    comment: 'Nhân viên kỹ thuật tiếp nhận/sửa chữa',
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'service_id',
    comment: 'Mã dịch vụ sửa chữa (bảng watch_services)',
  },
  issueDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'issue_description',
    comment: 'Mô tả tình trạng lỗi khách báo',
  },
  cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Chi phí sửa chữa dịch vụ khách phải trả',
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'paid'),
    allowNull: false,
    defaultValue: 'unpaid',
    field: 'payment_status',
    comment: 'Trạng thái thanh toán',
  },
  status: {
    type: DataTypes.ENUM('received', 'inspecting', 'in_progress', 'completed', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'received',
  },
  receivedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'received_date',
    comment: 'Ngày nhận máy',
  },
  appointmentDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'appointment_date',
    comment: 'Ngày hẹn trả máy cho khách',
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ghi chú của thợ kỹ thuật',
  },
}, {
  tableName: 'repair_tickets',
  timestamps: false,
});

export default RepairTicket;
