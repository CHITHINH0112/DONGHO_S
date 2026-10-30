export interface WatchVariant {
  id: number;
  sku: string;
  priceVND: number;
  priceUSD: number;
  mauMatSo?: string;
  images: string[];
  stockCount: number;
}

export interface WatchItem {
  id: string;
  name: string;
  brand: string;
  series: string;
  category: "all" | "spotlight" | "dive" | "tourbillon" | "chronograph" | "royal" | "jewelry";
  priceUSD: number;
  priceVND: number;
  image: string;
  gallery?: string[];
  tag: string;
  isNew?: boolean;
  isLimited?: boolean;
  rating: number;
  reviewsCount: number;
  variants?: WatchVariant[];
  warrantyMonths?: number;
  gender?: "male" | "female" | "unisex" | string;
  features?: { id: number; name: string; slug: string }[];
  specs: {
    diameter: string;
    thickness: string;
    caseMaterial: string;
    bezel: string;
    crystal: string;
    movement: string;
    calibre: string;
    jewels: string;
    powerReserve: string;
    waterResistance: string;
    frequency: string;
    strap: string;
    clasp: string;
  };
  description: string;
  highlights: string[];
}

export const WATCHES: WatchItem[] = [
  {
    id: "rolex-datejust-41-olive",
    name: "Datejust 41 Rolesor 'Olive Roman Dial'",
    brand: "Rolex Genève",
    series: "Oyster Perpetual Classic",
    category: "spotlight",
    priceUSD: 16900,
    priceVND: 428000000,
    image: "/images/submariner-emerald.jpg",
    gallery: [
      "/images/submariner-emerald.jpg",
      "/images/royaloak-emerald.jpg",
      "/images/tourbillon-emerald.jpg",
    ],
    tag: "Spotlight Exploded Masterpiece",
    isNew: true,
    rating: 5.0,
    reviewsCount: 52,
    specs: {
      diameter: "41 mm",
      thickness: "11.7 mm",
      caseMaterial: "Rolesor (Thép Oystersteel & Vàng Vàng 18K đúc)",
      bezel: "Vành băm rãnh Fluted Bezel bằng vàng 18K phản quang đa diện",
      crystal: "Kính Sapphire chống trầy kèm thấu kính Cyclops 2.5x tại góc 3 giờ",
      movement: "Cơ tự động lên dây 2 chiều Perpetual",
      calibre: "Calibre 3235 sản xuất in-house Thụy Sĩ",
      jewels: "31 chân kính hồng ngọc tự nhiên",
      powerReserve: "70 giờ trữ cót liên tục",
      waterResistance: "100 mét / 330 feet (Núm vặn Twinlock)",
      frequency: "28,800 vph (4 Hz) - Dây tóc Parachrom xanh kháng từ",
      strap: "Dây Jubilee 5 mối nối kim loại hoàn thiện bóng và xước",
      clasp: "Khóa gấp Oysterclasp kèm mắt nối tiện lợi Easylink 5mm",
    },
    description:
      "Mẫu đồng hồ kinh điển xuất hiện trong cỗ máy giải phẫu 3D. Mặt số màu xanh ô-liu chải tia sunburst kết hợp cùng các cọc số La Mã mạ vàng nguyên khối và vành khía Fluted Bezel vàng 18K huyền thoại.",
    highlights: [
      "Mẫu đồng hồ giải phẫu nguyên bản trong thước phim 3D",
      "Vành khía Fluted Bezel vàng 18K lấp lánh phản chiếu ánh sáng",
      "Bộ máy Calibre 3235 đạt chuẩn Superlative Chronometer ±2s/ngày",
      "Dây đeo Jubilee 5 mắt nối công thái học ôm sát cổ tay",
    ],
  },
  {
    id: "chrono-submariner-emerald",
    name: "Submariner Date 'Kermit Emerald'",
    brand: "Rolex Genève",
    series: "Professional Heritage",
    category: "dive",
    priceUSD: 14800,
    priceVND: 375000000,
    image: "/images/submariner-emerald.jpg",
    gallery: [
      "/images/submariner-emerald.jpg",
      "/images/chronograph-racing.jpg",
    ],
    tag: "COSC Chronometer",
    isNew: true,
    rating: 5.0,
    reviewsCount: 38,
    specs: {
      diameter: "41 mm",
      thickness: "12.3 mm",
      caseMaterial: "Thép Oystersteel 904L chống ăn mòn siêu cấp",
      bezel: "Vành gốm Cerachrom xoay 1 chiều màu xanh ngọc với vạch số khắc bạch kim",
      crystal: "Sapphire nguyên khối chống trầy kèm thấu kính Cyclops 2.5x",
      movement: "Tự động lên cót 2 chiều Perpetual",
      calibre: "Calibre 3235 in-house Thụy Sĩ",
      jewels: "31 chân kính hồng ngọc",
      powerReserve: "70 giờ trữ cót",
      waterResistance: "300 mét / 1,000 feet (Núm vặn Triplock 3 lớp)",
      frequency: "28,800 vph (4 Hz) - Dây tóc Parachrom xanh",
      strap: "Dây Oyster 3 mắt thép đúc nguyên khối",
      clasp: "Khóa an toàn Oysterlock với hệ thống mở rộng Glidelock",
    },
    description:
      "Huyền thoại đồng hồ lặn biển sâu nhất mọi thời đại. Vành gốm Cerachrom xanh ngọc lục bảo độc quyền chống xước vĩnh cửu kết hợp cùng mặt số đen sâu thẳm với cọc số phủ dạ quang Chromalight phát quang xanh lam rực rỡ dưới đáy biển.",
    highlights: [
      "Khả năng kháng áp suất nước tới độ sâu 300 mét tiêu chuẩn thợ lặn chuyên nghiệp",
      "Vành xoay gốm Cerachrom chống trầy và tia cực tím trọn đời",
      "Hệ thống khóa thông minh Glidelock điều chỉnh độ dài dây không cần dụng cụ",
      "Chứng nhận kép COSC và Rolex Superlative Chronometer",
    ],
  },
  {
    id: "chrono-royal-oak-emerald",
    name: "Royal Oak 'Jumbo' Extra-Thin Emerald Dial",
    brand: "Audemars & Piguet",
    series: "BRU_WATCH Le Brassus",
    category: "royal",
    priceUSD: 48500,
    priceVND: 1230000000,
    image: "/images/royaloak-emerald.jpg",
    gallery: [
      "/images/royaloak-emerald.jpg",
      "/images/tourbillon-emerald.jpg",
    ],
    tag: "BRU_WATCH",
    isLimited: true,
    rating: 5.0,
    reviewsCount: 29,
    specs: {
      diameter: "39 mm",
      thickness: "8.1 mm (Siêu mỏng Extra-Thin)",
      caseMaterial: "Bạch kim 950 (Platinum 950) đúc nguyên khối",
      bezel: "Bát giác hình học đặc trưng cố định bởi 8 ốc vít lục giác vàng trắng",
      crystal: "Sapphire chống lóa cả hai mặt trước và sau lộ máy",
      movement: "Cơ tự động siêu mỏng Calibre 7121",
      calibre: "Calibre 7121 in-house Le Brassus",
      jewels: "33 chân kính",
      powerReserve: "55 giờ trữ cót",
      waterResistance: "50 mét / 5 bar",
      frequency: "28,800 vph (4 Hz)",
      strap: "Dây kim loại Platinum 950 tích hợp vuốt nhọn hoàn thiện xước tia satin",
      clasp: "Khóa gấp đôi chữ AP đặc trưng",
    },
    description:
      "Kiệt tác mang tính cách mạng của ngài Gérald Genta. Phiên bản kỷ niệm đặc biệt với thân vỏ Platinum 950 đầm tay kết hợp mặt số màu xanh khói chải tia sunburst rực rỡ, không có họa tiết Petite Tapisserie nhằm tôn vinh tối đa độ sâu của màu xanh ngọc.",
    highlights: [
      "Thân vỏ và dây Platinum 950 chế tác thủ công tại thung lũng Vallée de Joux",
      "Độ dày chỉ 8.1 mm mang lại cảm giác lên tay thanh lịch tuyệt đối",
      "Rotor tự động bằng vàng hồng 22K khắc logo kỷ niệm 50 năm",
      "Mẫu giới hạn sản xuất số lượng ít mỗi năm",
    ],
  },
  {
    id: "chrono-tourbillon-emerald",
    name: "Flying Tourbillon 'Sovereign Emerald'",
    brand: "Aurélien Genève",
    series: "Grandes Complications",
    category: "tourbillon",
    priceUSD: 89000,
    priceVND: 2260000000,
    image: "/images/tourbillon-emerald.jpg",
    gallery: [
      "/images/tourbillon-emerald.jpg",
      "/images/royaloak-emerald.jpg",
    ],
    tag: "Độc Bản Tourbillon",
    isLimited: true,
    rating: 5.0,
    reviewsCount: 16,
    specs: {
      diameter: "42 mm",
      thickness: "11.2 mm",
      caseMaterial: "Vàng Hồng 18K 5N đúc hoàn thiện phay bóng và mờ",
      bezel: "Vàng Hồng 18K nạm 36 viên ngọc lục bảo thiên nhiên cắt baguette",
      crystal: "Sapphire cong mái vòm kép (Double domed) phủ 7 lớp chống lóa",
      movement: "Tourbillon bay lên cót tay với lồng quay 60 giây",
      calibre: "Calibre AG-Tourbillon 01 thủ công",
      jewels: "27 chân kính ruby tổng hợp",
      powerReserve: "120 giờ (5 ngày) qua 2 hộp cót đôi liên tiếp",
      waterResistance: "30 mét / 3 ATM",
      frequency: "21,600 vph (3 Hz) nhịp đập êm ái",
      strap: "Da cá sấu Alligator Mississippi khâu tay chỉ ngọc lục bảo",
      clasp: "Khóa bướm bấm gập bằng vàng hồng 18K",
    },
    description:
      "Đỉnh cao của nghệ thuật vi cơ khí Thụy Sĩ. Lồng Tourbillon bay lơ lửng tại góc 6 giờ chống lại hoàn toàn tác động của trọng lực trái đất lên lò xo cân bằng. Mặt số khung xương lộ cơ phô diễn từng cầu nối được vát mép vát bóng thủ công sắc sảo.",
    highlights: [
      "Cơ chế Flying Tourbillon xoay trọn vẹn 360 độ mỗi phút",
      "Thời lượng trữ cót phi thường 120 giờ (5 ngày liên tục)",
      "Vành đính ngọc lục bảo thiên nhiên tuyển chọn độ tinh khiết cao nhất",
      "Hoàn thiện thủ công đạt chuẩn Geneva Seal danh giá",
    ],
  },
  {
    id: "chrono-racing-heritage",
    name: "Chronograph 'Racing Green Heritage'",
    brand: "Verdant Horology",
    series: "Motorsport Classic",
    category: "chronograph",
    priceUSD: 21500,
    priceVND: 546000000,
    image: "/images/chronograph-racing.jpg",
    gallery: [
      "/images/chronograph-racing.jpg",
      "/images/omega-speedmaster.jpg",
    ],
    tag: "Bấm Giờ Đua Xe",
    isNew: true,
    rating: 4.9,
    reviewsCount: 44,
    specs: {
      diameter: "40 mm",
      thickness: "13.1 mm",
      caseMaterial: "Thép 316L kết hợp viền vàng vàng 18K",
      bezel: "Thước đo tốc độ Tachymeter thang đo 500 km/h",
      crystal: "Sapphire dạng hộp (Glassbox) phong cách vintage",
      movement: "Cơ bấm giờ tự động với bánh xe cột (Column Wheel)",
      calibre: "Calibre VH-Cal.77 thủ công",
      jewels: "33 chân kính",
      powerReserve: "65 giờ trữ cót",
      waterResistance: "100 mét / 10 bar",
      frequency: "28,800 vph (4 Hz) - Khớp ly hợp thẳng đứng",
      strap: "Da bò Ý thuộc thảo mộc màu rượu Cognac may chỉ nổi",
      clasp: "Khóa cài kim bằng vàng 18K khắc triện đầu thú",
    },
    description:
      "Sự kết hợp hoàn hảo giữa tinh thần đua xe cổ điển và thẩm mỹ BRU_WATCH. Mặt số màu xanh lá đua xe British Racing Green đối lập với các mặt số phụ màu vàng champagne tạo nên sự ấm áp, lịch lãm của quý ông thượng lưu.",
    highlights: [
      "Cơ chế bấm giờ bấm êm mượt với Column Wheel & Vertical Clutch",
      "Mặt số xanh British Racing Green sâu thẳm quý phái",
      "Kính Sapphire dáng Glassbox hoài cổ của thập niên 1960",
      "Tặng kèm 01 bộ dây cao su thể thao xanh rừng chính hãng",
    ],
  },
  {
    id: "chrono-diamond-emerald-haute",
    name: "Heirloom Haute Joaillerie Emerald",
    brand: "Patek & Philippe",
    series: "High Jewelry Masterpiece",
    category: "jewelry",
    priceUSD: 125000,
    priceVND: 3175000000,
    image: "/images/emerald-diamond.jpg",
    gallery: [
      "/images/emerald-diamond.jpg",
      "/images/cartier-santos.jpg",
    ],
    tag: "High Jewelry 18K",
    isLimited: true,
    rating: 5.0,
    reviewsCount: 9,
    specs: {
      diameter: "36 mm",
      thickness: "8.6 mm (Thanh mảnh quý phái)",
      caseMaterial: "Vàng Trắng 18K nạm kim cương brilliant-cut toàn bộ thân vỏ",
      bezel: "Nạm 48 viên ngọc lục bảo thiên nhiên cắt giác baguette (3.4 ct)",
      crystal: "Kính Sapphire chống trầy với độ truyền sáng 99.8%",
      movement: "Cơ lên cót tay siêu mỏng hoàn thiện thủ công",
      calibre: "Calibre 215 PS danh tiếng",
      jewels: "18 chân kính đính cẩn thận",
      powerReserve: "44 giờ trữ cót",
      waterResistance: "30 mét / 3 ATM",
      frequency: "28,800 vph",
      strap: "Dây lụa Satin cao cấp màu xanh lục bảo óng ả",
      clasp: "Khóa cài vàng trắng nạm 24 viên kim cương tự nhiên",
    },
    description:
      "Kiệt tác ngọc quý dành cho các đêm tiệc hoàng gia. Vành bezel được tuyển chọn gắt gao từ 48 viên ngọc lục bảo tự nhiên Colombia cắt dạng baguette đồng màu hoàn hảo, ôm trọn mặt số xà cừ ngọc trai lấp lánh phản chiếu ánh sáng kiêu sa.",
    highlights: [
      "48 viên ngọc lục bảo Colombia giác cắt Baguette chuẩn quốc tế",
      "Mặt số xà cừ ngọc trai tự nhiên đổi màu quang phổ",
      "Thân vỏ vàng trắng 18k nạm full kim cương giác cắt Brilliant",
      "Kèm giấy chứng nhận đá quý SSEF Thụy Sĩ",
    ],
  },
  {
    id: "cartier-santos-skeleton-noir",
    name: "Santos de Cartier Skeleton Nocturne",
    brand: "Cartier",
    series: "Iconic Santos Collection",
    category: "royal",
    priceUSD: 31500,
    priceVND: 799000000,
    image: "/images/cartier-santos.jpg",
    gallery: [
      "/images/cartier-santos.jpg",
      "/images/emerald-diamond.jpg",
    ],
    tag: "Mặt Số Skeleton Cơ Học",
    isNew: true,
    rating: 4.9,
    reviewsCount: 31,
    specs: {
      diameter: "39.8 mm",
      thickness: "9.08 mm",
      caseMaterial: "Thép cao cấp kết hợp Vàng Vàng 18K và lớp phủ ADLC đen",
      bezel: "Vành bezel vuông bo góc đính 8 đinh vít biểu tượng",
      crystal: "Kính Sapphire nguyên khối chống lóa cả hai mặt",
      movement: "Cơ lên cót tay Calibre 9611 MC",
      calibre: "Calibre 9611 MC in-house Thụy Sĩ",
      jewels: "20 chân kính",
      powerReserve: "72 giờ trữ cót",
      waterResistance: "100 mét / 10 bar",
      frequency: "28,800 vph (4 Hz)",
      strap: "Hệ thống QuickSwitch dây kim loại demi & tặng kèm dây da bê",
      clasp: "Khóa gập đôi thông minh SmartLink tự chỉnh mắt dây",
    },
    description:
      "Mẫu đồng hồ đeo tay đầu tiên trên thế giới của phi công Alberto Santos-Dumont tái sinh dưới hình thái Skeleton lộ cơ độc đáo. Các cầu nối của bộ máy cơ được gia công tạo hình trực tiếp thành các chữ số La Mã huyền thoại của Cartier.",
    highlights: [
      "Cầu máy cơ khí cắt gọt thành chữ số La Mã độc bản sáng chế của Cartier",
      "Hệ thống thay dây nhanh QuickSwitch không cần dụng cụ trong 3 giây",
      "Công nghệ tự tháo mắt dây SmartLink vừa vặn mọi cổ tay",
      "Núm vặn đính đá Spinel xanh cabochon quý tộc",
    ],
  },
  {
    id: "vacheron-overseas-dual-time-blue",
    name: "Overseas Dual Time 'Lacquered Deep Blue'",
    brand: "Vacheron Constantin",
    series: "The Spirit of Travel",
    category: "spotlight",
    priceUSD: 39800,
    priceVND: 1010000000,
    image: "/images/vacheron-overseas.jpg",
    gallery: [
      "/images/vacheron-overseas.jpg",
      "/images/submariner-emerald.jpg",
    ],
    tag: "Geneva Seal Thụy Sĩ",
    isLimited: false,
    rating: 5.0,
    reviewsCount: 27,
    specs: {
      diameter: "41 mm",
      thickness: "12.8 mm",
      caseMaterial: "Thép không gỉ cao cấp hoàn thiện xước tia và đánh bóng gương",
      bezel: "Vành bezel lấy cảm hứng từ chữ thập Maltese Cross 6 cạnh",
      crystal: "Kính Sapphire chống xước tuyệt đối với lớp phủ chống lóa",
      movement: "Cơ tự động Calibre 5110 DT đạt chứng chỉ Geneva Seal",
      calibre: "Calibre 5110 DT in-house Geneva",
      jewels: "37 chân kính ruby",
      powerReserve: "60 giờ trữ cót",
      waterResistance: "150 mét / 15 bar (Vòng bảo vệ chống từ mềm)",
      frequency: "28,800 vph (4 Hz)",
      strap: "Hệ thống dây hoán đổi: Dây thép Maltese + Dây cao su + Dây da cá sấu",
      clasp: "Khóa bướm bấm gập thép 3 cánh",
    },
    description:
      "Biểu tượng cho tinh thần viễn du của nhà chế tác đồng hồ lâu đời nhất thế giới từ năm 1755. Mặt số màu xanh lam sơn mài đa lớp sâu thẳm biến đổi sắc độ theo góc nhìn ánh sáng, đi kèm kim hiển thị múi giờ thứ hai (Dual Time) và chỉ báo ngày đêm AM/PM.",
    highlights: [
      "Đạt chuẩn chứng nhận danh giá Poinçon de Genève (Geneva Seal)",
      "Bộ 3 dây đeo hoán đổi dễ dàng: Thép kim loại, Da cá sấu và Cao su thể thao",
      "Vòng chống từ tính bảo vệ cỗ máy cơ học khỏi thiết bị điện tử",
      "Rotor tự động bằng vàng 22K nguyên khối khắc biểu tượng la bàn hoa gió",
    ],
  },
  {
    id: "omega-speedmaster-moonwatch-pro",
    name: "Speedmaster Moonwatch Professional Master Chronometer",
    brand: "Omega",
    series: "Space Exploration Legacy",
    category: "chronograph",
    priceUSD: 9200,
    priceVND: 234000000,
    image: "/images/omega-speedmaster.jpg",
    gallery: [
      "/images/omega-speedmaster.jpg",
      "/images/chronograph-racing.jpg",
    ],
    tag: "Đồng Hồ Mặt Trăng",
    isNew: false,
    rating: 5.0,
    reviewsCount: 65,
    specs: {
      diameter: "42 mm",
      thickness: "13.2 mm",
      caseMaterial: "Thép không gỉ kết hợp vành nhôm anodized đen",
      bezel: "Thước đo tốc độ Tachymeter với dấu chấm huyền thoại 'Dot Over Ninety'",
      crystal: "Kính Sapphire chống trầy mặt trước và đáy lộ cơ Sapphire Sandwich",
      movement: "Cơ lên cót tay bấm giờ Co-Axial Master Chronometer",
      calibre: "Calibre 3861 chống từ 15,000 Gauss",
      jewels: "26 chân kính",
      powerReserve: "50 giờ trữ cót",
      waterResistance: "50 mét / 167 feet",
      frequency: "21,600 vph (3 Hz) - Bộ thoát Co-Axial",
      strap: "Dây thép 5 mắt nối thiết kế công thái học vintage",
      clasp: "Khóa bấm gấp tiện lợi có khắc logo Omega cổ điển",
    },
    description:
      "Chiếc đồng hồ huyền thoại được NASA chứng nhận cho mọi chuyến bay vào vũ trụ và là cỗ máy thời gian đầu tiên được các phi hành gia đeo lên bề mặt Mặt Trăng năm 1969. Trang bị cỗ máy Calibre 3861 thế hệ mới kháng từ trường lên tới 15.000 gauss.",
    highlights: [
      "Chứng nhận Master Chronometer từ Viện Đo lường Liên bang Thụy Sĩ (METAS)",
      "Kháng từ trường cực đại 15,000 Gauss từ nam châm và máy MRI",
      "Bộ thoát đồng trục Co-Axial Escapement giảm ma sát tối đa",
      "Kính Sapphire Sandwich cho phép chiêm ngưỡng trọn vẹn cỗ máy lên cót tay",
    ],
  },
];
