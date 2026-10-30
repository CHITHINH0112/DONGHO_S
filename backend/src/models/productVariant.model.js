import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_id',
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  costPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'cost_price',
  },
  status: {
    type: DataTypes.ENUM('active', 'hidden'),
    allowNull: false,
    defaultValue: 'active',
  },
  mauMatSo: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'Mau_Mat_So',
    comment: 'Màu mặt số (VD: Đen, Trắng...)',
  },
}, {
  tableName: 'product_variants',
  timestamps: false,
});

export default ProductVariant;
