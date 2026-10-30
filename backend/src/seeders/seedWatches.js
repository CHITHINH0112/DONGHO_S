import { sequelize, Category, Watch, User } from '../models/index.js';
import { ensureDatabaseExists } from '../config/database.js';

const SAMPLE_CATEGORIES = [
  { id: 'spotlight', name: 'Kiệt tác Spotlight', slug: 'spotlight', description: 'Các kiệt tác đồng hồ giải phẫu 3D độc bản' },
  { id: 'dive', name: 'Đồng hồ Lặn Dive Watch', slug: 'dive', description: 'Bộ sưu tập chuyên dụng chống nước sâu' },
  { id: 'tourbillon', name: 'Grand Complication Tourbillon', slug: 'tourbillon', description: 'Cỗ máy đỉnh cao chống trọng lực trái đất' },
  { id: 'chronograph', name: 'Chronograph Đua Xe', slug: 'chronograph', description: 'Đo tốc độ thể thao chuẩn xác' },
  { id: 'royal', name: 'Royal BRU_WATCH', slug: 'royal', description: 'Phong cách quý tộc hoàng gia Thụy Sĩ' },
  { id: 'jewelry', name: 'Kim Cương Đá Quý Haute Joaillerie', slug: 'jewelry', description: 'Tuyệt phẩm nạm kim cương và vàng hồng' },
];

const SAMPLE_WATCHES = [
  {
    id: 'rolex-datejust-41-olive',
    name: "Datejust 41 Rolesor 'Olive Roman Dial'",
    brand: 'Rolex Genève',
    series: 'Oyster Perpetual Classic',
    categoryId: 'spotlight',
    categorySlug: 'spotlight',
    priceUSD: 16900,
    priceVND: 428000000,
    image: '/images/submariner-emerald.jpg',
    gallery: [
      '/images/submariner-emerald.jpg',
      '/images/royaloak-emerald.jpg',
      '/images/tourbillon-emerald.jpg',
    ],
    tag: 'Spotlight Exploded Masterpiece',
    isNew: true,
    isLimited: false,
    rating: 5.0,
    reviewsCount: 52,
    specs: {
      diameter: '41 mm',
      thickness: '11.7 mm',
      caseMaterial: 'Rolesor (Thép Oystersteel & Vàng Vàng 18K đúc)',
      bezel: 'Vành băm rãnh Fluted Bezel bằng vàng 18K phản quang đa diện',
      crystal: 'Kính Sapphire chống trầy kèm thấu kính Cyclops 2.5x tại góc 3 giờ',
      movement: 'Cơ tự động lên dây 2 chiều Perpetual',
      calibre: 'Calibre 3235 sản xuất in-house Thụy Sĩ',
      jewels: '31 chân kính hồng ngọc tự nhiên',
      powerReserve: '70 giờ trữ cót liên tục',
      waterResistance: '100 mét / 330 feet (Núm vặn Twinlock)',
      frequency: '28,800 vph (4 Hz) - Dây tóc Parachrom xanh kháng từ',
      strap: 'Dây Jubilee 5 mối nối kim loại hoàn thiện bóng và xước',
      clasp: 'Khóa gấp Oysterclasp kèm mắt nối tiện lợi Easylink 5mm',
    },
    description: 'Mẫu đồng hồ kinh điển xuất hiện trong cỗ máy giải phẫu 3D. Mặt số màu xanh ô-liu chải tia sunburst kết hợp cùng các cọc số La Mã mạ vàng nguyên khối và vành khía Fluted Bezel vàng 18K huyền thoại.',
    highlights: [
      'Mẫu đồng hồ giải phẫu nguyên bản trong thước phim 3D',
      'Vành khía Fluted Bezel vàng 18K lấp lánh phản chiếu ánh sáng',
      'Bộ máy Calibre 3235 đạt chuẩn Superlative Chronometer ±2s/ngày',
      'Dây đeo Jubilee 5 mắt nối công thái học ôm sát cổ tay',
    ],
  },
  {
    id: 'chrono-submariner-emerald',
    name: "Submariner Date 'Kermit Emerald'",
    brand: 'Rolex Genève',
    series: 'Professional Heritage',
    categoryId: 'dive',
    categorySlug: 'dive',
    priceUSD: 14800,
    priceVND: 375000000,
    image: '/images/submariner-emerald.jpg',
    gallery: [
      '/images/submariner-emerald.jpg',
      '/images/chronograph-racing.jpg',
    ],
    tag: 'COSC Chronometer',
    isNew: true,
    isLimited: false,
    rating: 5.0,
    reviewsCount: 38,
    specs: {
      diameter: '41 mm',
      thickness: '12.3 mm',
      caseMaterial: 'Thép Oystersteel 904L chống ăn mòn siêu cấp',
      bezel: 'Vành gốm Cerachrom xoay 1 chiều màu xanh ngọc với vạch số khắc bạch kim',
      crystal: 'Sapphire nguyên khối chống trầy kèm thấu kính Cyclops 2.5x',
      movement: 'Cơ tự động Thụy Sĩ',
      calibre: 'Calibre 3235',
      jewels: '31 chân kính',
      powerReserve: '70 giờ',
      waterResistance: '300 mét / 1,000 feet',
      frequency: '28,800 vph (4 Hz)',
      strap: 'Dây Oyster thép 3 mối nối',
      clasp: 'Khóa an toàn Oysterlock kèm hệ thống nới rộng Rolex Glidelock',
    },
    description: 'Biểu tượng thợ lặn huyền thoại với viền gốm xanh lục bảo Cerachrom rực rỡ.',
    highlights: [
      'Chống nước chuyên dụng 300 mét',
      'Viền xoay Cerachrom xanh ngọc lục bảo chống trầy xước',
      'Dạ quang Chromalight phát sáng xanh lam rực rỡ dưới đáy biển',
    ],
  },
];

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Đang kiểm tra và khởi tạo Database...');
    await ensureDatabaseExists();
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    console.log('[Seeder] Đang nạp Categories...');
    for (const cat of SAMPLE_CATEGORIES) {
      await Category.upsert(cat);
    }

    console.log('[Seeder] Đang nạp Watches mẫu...');
    for (const watch of SAMPLE_WATCHES) {
      await Watch.upsert(watch);
    }

    console.log('[Seeder] Đang tạo tài khoản mẫu...');
    const adminExists = await User.findOne({ where: { email: 'admin@dongho.vn' } });
    if (!adminExists) {
      await User.create({
        fullName: 'Quản trị viên Luxury Watch',
        email: 'admin@dongho.vn',
        password: 'admin123456',
        role: 'admin',
        phone: '0901234567',
      });
      console.log('[Seeder] Tạo tài khoản Admin thành công: admin@dongho.vn / admin123456');
    }

    const customerExists = await User.findOne({ where: { email: 'customer@dongho.vn' } });
    if (!customerExists) {
      await User.create({
        fullName: 'Khách hàng VIP Nguyễn Văn A',
        email: 'customer@dongho.vn',
        password: 'customer123',
        role: 'customer',
        phone: '0988776655',
      });
      console.log('[Seeder] Tạo tài khoản Customer thành công: customer@dongho.vn / customer123');
    }

    console.log('✅ [Seeder] Hoàn tất nạp dữ liệu mẫu thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seeder Error] Nạp dữ liệu thất bại:', error.message);
    process.exit(1);
  }
};

seedDatabase();
