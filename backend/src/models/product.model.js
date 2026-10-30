import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'brand_id',
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'category_id',
  },
  basePrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'base_price',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'unisex'),
    allowNull: false,
    defaultValue: 'unisex',
  },
  loaiBoMay: {
    type: DataTypes.ENUM('quartz', 'automatic', 'manual', 'solar', 'smart'),
    allowNull: true,
    field: 'loai_bo_may',
  },
  chatLieuKinh: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'Chat_Lieu_Kinh',
    comment: 'Kính (VD: Sapphire, Kính cứng...)',
  },
  duongKinhMatSo: {
    type: DataTypes.DECIMAL(5, 1),
    allowNull: true,
    field: 'Duong_Kinh_Mat_So',
    comment: 'Đường kính mặt số (đơn vị mm, VD: 41.0)',
  },
  beDayMatSo: {
    type: DataTypes.DECIMAL(5, 1),
    allowNull: true,
    field: 'Be_Day_Mat_So',
    comment: 'Bề dày mặt số (đơn vị mm, VD: 10.0)',
  },
  chatLieuNieng: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'Chat_Lieu_Nieng',
    comment: 'Niềng (VD: Thép không gỉ)',
  },
  chatLieuDayDeo: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'Chat_Lieu_Day_Deo',
    comment: 'Dây đeo (VD: Thép không gỉ, Dây da...)',
  },
  khaNangChongNuoc: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'Kha_Nang_Chong_Nuoc',
    comment: 'Chống nước (VD: 5 ATM)',
  },
  trackSerial: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'track_serial',
  },
  warrantyMonths: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 12,
    field: 'warranty_months',
  },
  status: {
    type: DataTypes.ENUM('active', 'hidden', 'discontinued'),
    allowNull: false,
    defaultValue: 'active',
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'image_url',
    comment: 'Đường dẫn ảnh đại diện chung của sản phẩm',
  },
}, {
  tableName: 'products',
  timestamps: false,
});

export default Product;
