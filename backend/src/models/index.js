import { sequelize } from '../config/database.js';

// 1. Nhóm Quản trị & Người dùng
import Admin from './admin.model.js';
import User from './user.model.js';
import UserAddress from './userAddress.model.js';
import CashierShift from './cashierShift.model.js';
import ApprovalRequest from './approvalRequest.model.js';
import AuditLog from './auditLog.model.js';

// 2. Nhóm Sản phẩm, Biến thể & Kho
import Brand from './brand.model.js';
import Category from './category.model.js';
import Feature from './feature.model.js';
import Product from './product.model.js';
import ProductFeature from './productFeature.model.js';
import ProductVariant from './productVariant.model.js';
import ProductVariantImage from './productVariantImage.model.js';
import SerialNumber from './serialNumber.model.js';

// 3. Nhóm Giỏ hàng & Đơn hàng
import Cart from './cart.model.js';
import CartItem from './cartItem.model.js';
import Order from './order.model.js';
import OrderItem from './orderItem.model.js';
import OrderItemSerial from './orderItemSerial.model.js';
import OrderReturn from './orderReturn.model.js';
import Shipment from './shipment.model.js';

// 4. Nhóm Bảo hành & Dịch vụ
import WatchService from './watchService.model.js';
import RepairTicket from './repairTicket.model.js';
import Warranty from './warranty.model.js';
import WarrantyClaim from './warrantyClaim.model.js';

// 5. CMS
import Banner from './banner.model.js';

// ==========================================
// THIẾT LẬP CÁC QUAN HỆ (ASSOCIATIONS)
// ==========================================

// --- Approval Requests ---
ApprovalRequest.belongsTo(Admin, { as: 'requester', foreignKey: 'Nguoi_Yeu_Cau' });
ApprovalRequest.belongsTo(Admin, { as: 'approver', foreignKey: 'Nguoi_Phe_Duyet' });

// --- Carts & Cart Items ---
User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

CartItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant', onDelete: 'CASCADE' });
ProductVariant.hasMany(CartItem, { foreignKey: 'variant_id', as: 'cartItems' });

// --- Cashier Shifts ---
CashierShift.belongsTo(Admin, { as: 'cashier', foreignKey: 'cashier_id' });
CashierShift.belongsTo(Admin, { as: 'opener', foreignKey: 'opened_by_admin_id' });
CashierShift.belongsTo(CashierShift, { as: 'previousShift', foreignKey: 'previous_shift_id' });

// --- Categories (Self-referencing parent-child) ---
Category.hasMany(Category, { as: 'children', foreignKey: 'parent_id', onDelete: 'SET NULL' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });

// --- Products, Brands, Categories ---
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products', onDelete: 'SET NULL' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

Category.hasMany(Product, { foreignKey: 'category_id', as: 'products', onDelete: 'SET NULL' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// --- Product & Features (Many-to-Many) ---
Product.belongsToMany(Feature, { through: ProductFeature, foreignKey: 'product_id', otherKey: 'feature_id', as: 'features' });
Feature.belongsToMany(Product, { through: ProductFeature, foreignKey: 'feature_id', otherKey: 'product_id', as: 'products' });

// --- Product & Variants ---
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// --- Product Variants & Images ---
ProductVariant.hasMany(ProductVariantImage, { foreignKey: 'variant_id', as: 'images', onDelete: 'CASCADE' });
ProductVariantImage.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// --- Product Variants & Serial Numbers ---
ProductVariant.hasMany(SerialNumber, { foreignKey: 'variant_id', as: 'serialNumbers' });
SerialNumber.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
// --- Serial Numbers & Admins (Import & Warehouse Confirmation) ---
SerialNumber.belongsTo(Admin, { as: 'importedBy', foreignKey: 'imported_by_admin_id' });
SerialNumber.belongsTo(Admin, { as: 'warehouseStaff', foreignKey: 'warehouse_confirmed_by' });
Admin.hasMany(SerialNumber, { as: 'importedSerials', foreignKey: 'imported_by_admin_id' });
Admin.hasMany(SerialNumber, { as: 'confirmedSerials', foreignKey: 'warehouse_confirmed_by' });


// --- User & Addresses ---
User.hasMany(UserAddress, { foreignKey: 'user_id', as: 'addresses', onDelete: 'CASCADE' });
UserAddress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// --- Orders ---
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders', onDelete: 'SET NULL' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Order.belongsTo(UserAddress, { foreignKey: 'user_address_id', as: 'address', onDelete: 'SET NULL' });
Order.belongsTo(Admin, { as: 'saleStaff', foreignKey: 'sale_staff_id', onDelete: 'SET NULL' });
Order.belongsTo(CashierShift, { as: 'shift', foreignKey: 'shift_id', onDelete: 'SET NULL' });

// --- Order & Order Items ---
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

OrderItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
ProductVariant.hasMany(OrderItem, { foreignKey: 'variant_id', as: 'orderItems' });

// --- Order Items & Serials (Many-to-Many qua order_item_serials) ---
OrderItem.belongsToMany(SerialNumber, { through: OrderItemSerial, foreignKey: 'order_item_id', otherKey: 'serial_number_id', as: 'serials' });
SerialNumber.belongsToMany(OrderItem, { through: OrderItemSerial, foreignKey: 'serial_number_id', otherKey: 'order_item_id', as: 'orderItems' });

// --- Order Returns ---
Order.hasMany(OrderReturn, { foreignKey: 'order_id', as: 'returns' });
OrderReturn.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderReturn.belongsTo(SerialNumber, { as: 'oldSerial', foreignKey: 'old_serial_number_id' });
OrderReturn.belongsTo(SerialNumber, { as: 'newSerial', foreignKey: 'new_serial_number_id' });

// --- Shipments ---
Order.hasOne(Shipment, { foreignKey: 'order_id', as: 'shipment', onDelete: 'CASCADE' });
Shipment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// --- Repair Tickets ---
RepairTicket.belongsTo(SerialNumber, { foreignKey: 'serial_number_id', as: 'serialNumber' });
RepairTicket.belongsTo(User, { foreignKey: 'customer_id', as: 'customer', onDelete: 'SET NULL' });
RepairTicket.belongsTo(Admin, { foreignKey: 'staff_id', as: 'staff', onDelete: 'SET NULL' });
RepairTicket.belongsTo(WatchService, { foreignKey: 'service_id', as: 'service' });

// --- Warranties ---
Warranty.belongsTo(SerialNumber, { foreignKey: 'serial_number_id', as: 'serialNumber' });
Warranty.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'SET NULL' });
Warranty.belongsTo(Order, { foreignKey: 'order_id', as: 'order', onDelete: 'SET NULL' });

// --- Warranty Claims ---
WarrantyClaim.belongsTo(SerialNumber, { foreignKey: 'serial_number_id', as: 'serialNumber' });
WarrantyClaim.belongsTo(Warranty, { foreignKey: 'warranty_id', as: 'warranty', onDelete: 'SET NULL' });
WarrantyClaim.belongsTo(User, { foreignKey: 'customer_id', as: 'customer', onDelete: 'SET NULL' });
WarrantyClaim.belongsTo(Admin, { foreignKey: 'staff_id', as: 'staff', onDelete: 'SET NULL' });
WarrantyClaim.belongsTo(WatchService, { foreignKey: 'service_id', as: 'service', onDelete: 'SET NULL' });
WatchService.hasMany(WarrantyClaim, { foreignKey: 'service_id', as: 'claims' });

// Khả năng tương thích ngược
export const Watch = Product;

export {
  sequelize,
  Admin,
  User,
  UserAddress,
  CashierShift,
  ApprovalRequest,
  AuditLog,
  Brand,
  Category,
  Feature,
  Product,
  ProductFeature,
  ProductVariant,
  ProductVariantImage,
  SerialNumber,
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderItemSerial,
  OrderReturn,
  Shipment,
  WatchService,
  RepairTicket,
  Warranty,
  WarrantyClaim,
  Banner,
};

export default {
  sequelize,
  Admin,
  User,
  UserAddress,
  CashierShift,
  ApprovalRequest,
  AuditLog,
  Brand,
  Category,
  Feature,
  Product,
  ProductFeature,
  ProductVariant,
  ProductVariantImage,
  SerialNumber,
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderItemSerial,
  OrderReturn,
  Shipment,
  WatchService,
  RepairTicket,
  Warranty,
  WarrantyClaim,
  Banner,
};
