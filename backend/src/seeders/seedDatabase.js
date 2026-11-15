import {
  sequelize,
  Brand,
  Category,
  Product,
  ProductVariant,
  SerialNumber,
  Admin,
  User,
  UserAddress,
  WatchService,
} from '../models/index.js';
import { ensureDatabaseExists } from '../config/database.js';

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Kiểm tra và khởi tạo Database dongho_shop...');
    await ensureDatabaseExists();
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });

    console.log('[Seeder] Nạp Brands...');
    await Brand.bulkCreate([
      { id: 1, name: 'Casio', slug: 'casio', country: 'Nhật Bản' },
      { id: 2, name: 'Seiko', slug: 'seiko', country: 'Nhật Bản' },
      { id: 5, name: 'Tissot', slug: 'tissot', country: 'Thụy Sỹ' },
    ], { updateOnDuplicate: ['name', 'slug', 'country'] });

    console.log('[Seeder] Nạp Categories...');
    await Category.bulkCreate([
      { id: 1, parentId: null, name: 'Đồng hồ nam', slug: 'dong-ho-nam' },
      { id: 2, parentId: null, name: 'Đồng hồ nữ', slug: 'dong-ho-nu' },
    ], { updateOnDuplicate: ['parentId', 'name', 'slug'] });

    console.log('[Seeder] Nạp Admins...');
    await Admin.bulkCreate([
      { id: 1, staffCode: 'AD001', name: 'Admin Watch Shop', email: 'admin@watchshop.local', passwordHash: 'admin123456', role: 'admin', position: 'manager', isActive: true },
      { id: 6, staffCode: 'SALE06', name: 'Nhân viên Sale & Thu ngân 6', email: 'staff6@watchshop.local', passwordHash: 'staff123', role: 'staff', position: 'sales', isActive: true },
      { id: 8, staffCode: 'KHO08', name: 'Nhân viên Kho 8', email: 'staff8@watchshop.local', passwordHash: 'staff123', role: 'staff', position: 'warehouse', isActive: true },
      { id: 11, staffCode: 'SALE11', name: 'Nhân viên Sale & Thu ngân 11', email: 'staff11@watchshop.local', passwordHash: 'staff123', role: 'staff', position: 'sales', isActive: true },
      { id: 13, staffCode: 'TECH13', name: 'Thợ sửa đồng hồ', email: 'tech@watchshop.local', passwordHash: 'tech123', role: 'staff', position: 'technician', isActive: true },
    ], { updateOnDuplicate: ['staffCode', 'name', 'email', 'role', 'position', 'isActive'] });

    console.log('[Seeder] Nạp Products...');
    await Product.bulkCreate([
      {
        id: 1,
        name: 'Casio G-Shock GA-2100',
        slug: 'casio-g-shock-ga-2100',
        brandId: 1,
        categoryId: 1,
        basePrice: 3200000.00,
        gender: 'male',
        loaiBoMay: 'quartz',
        trackSerial: true,
        warrantyMonths: 12,
        status: 'active',
      },
      {
        id: 3,
        name: 'Seiko 5 Sports SRPD55K1',
        slug: 'seiko-5-sports-srpd55k1',
        brandId: 2,
        categoryId: 1,
        basePrice: 5800000.00,
        gender: 'male',
        loaiBoMay: 'automatic',
        trackSerial: true,
        warrantyMonths: 24,
        status: 'active',
      },
    ], { updateOnDuplicate: ['name', 'slug', 'brandId', 'categoryId', 'basePrice', 'gender', 'loaiBoMay', 'status'] });

    console.log('[Seeder] Nạp Product Variants...');
    await ProductVariant.bulkCreate([
      { id: 1, productId: 1, sku: 'CAS-GA2100-BLK', price: 3200000.00, costPrice: 2450000.00, status: 'active' },
      { id: 4, productId: 3, sku: 'SEI-SRPD55-BLK', price: 5800000.00, costPrice: 4500000.00, status: 'active' },
    ], { updateOnDuplicate: ['productId', 'sku', 'price', 'costPrice', 'status'] });

    console.log('[Seeder] Nạp Serial Numbers...');
    await SerialNumber.bulkCreate([
      { id: 1, variantId: 1, serialNumber: 'SN-GA2100-0001', status: 'sold', itemCondition: 'new', location: 'warehouse' },
      { id: 2, variantId: 1, serialNumber: 'SN-GA2100-0002', status: 'available', itemCondition: 'new', location: 'warehouse' },
      { id: 9, variantId: 4, serialNumber: 'SN-SRPD55-0001', status: 'available', itemCondition: 'new', location: 'warehouse' },
    ], { updateOnDuplicate: ['variantId', 'serialNumber', 'status', 'itemCondition', 'location'] });

    console.log('[Seeder] Nạp Users & Addresses...');
    await User.bulkCreate([
      { id: 2, name: 'Nguyễn Văn Nam', email: 'user2@watchshop.local', phone: '0123456789', status: 'active' },
      { id: 3, name: 'Trần Thị Sương', email: 'user3@watchshop.local', phone: '0321421562', status: 'active' },
    ], { updateOnDuplicate: ['name', 'email', 'phone', 'status'] });

    await UserAddress.bulkCreate([
      { id: 1, userId: 2, receiverName: 'Nguyễn Văn Nam', phone: '0123456789', address: 'Số 10 Nguyễn Văn Linh, Phú Mỹ Hưng, Quận 7, TP.HCM (Nhà riêng)', isDefault: true },
      { id: 2, userId: 2, receiverName: 'Nguyễn Văn Nam', phone: '0123456789', address: 'Tòa nhà Bitexco, Số 2 Hải Triều, Quận 1, TP.HCM (Công ty)', isDefault: false },
      { id: 3, userId: 3, receiverName: 'Trần Thị Sương', phone: '0321421562', address: '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM', isDefault: true },
    ], { updateOnDuplicate: ['userId', 'receiverName', 'phone', 'address', 'isDefault'] });

    
    console.log('[Seeder] Nạp Watch Services...');
    await WatchService.bulkCreate([
      { id: 1, name: 'Thay pin', serviceType: 'battery', basePrice: 150000.00, estimatedDays: 1, isActive: true },
      { id: 2, name: 'Thay dây', serviceType: 'strap', basePrice: 100000.00, estimatedDays: 1, isActive: true },
      { id: 3, name: 'Cắt / rút mắc dây', serviceType: 'resize', basePrice: 50000.00, estimatedDays: 1, isActive: true },
      { id: 4, name: 'Đánh bóng vỏ', serviceType: 'polish', basePrice: 300000.00, estimatedDays: 3, isActive: true },
      { id: 5, name: 'Test và ép gioăng chống nước', serviceType: 'waterproof', basePrice: 200000.00, estimatedDays: 2, isActive: true },
      { id: 6, name: 'Sửa máy', serviceType: 'repair', basePrice: 500000.00, estimatedDays: 7, isActive: true },
      { id: 7, name: 'Bảo dưỡng định kỳ', serviceType: 'service', basePrice: 1500000.00, estimatedDays: 14, isActive: true },
    ], { updateOnDuplicate: ['name', 'serviceType', 'basePrice', 'estimatedDays', 'isActive'] });

    console.log('✅ [Seeder] Nạp toàn bộ dữ liệu mẫu dongho_shop thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seeder Error] Thất bại:', error.message);
    process.exit(1);
  }
};

seedDatabase();
