import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const WatchService = sequelize.define('WatchService', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
  },
  serviceType: {
    type: DataTypes.ENUM('battery', 'strap', 'resize', 'polish', 'waterproof', 'repair', 'service'),
    allowNull: false,
    field: 'service_type',
  },
  basePrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'base_price',
  },
  estimatedDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'estimated_days',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'watch_services',
  timestamps: false,
});

export default WatchService;
