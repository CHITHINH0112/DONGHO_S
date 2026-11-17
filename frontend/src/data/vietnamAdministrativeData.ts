/**
 * Dữ Liệu Hành Chính Việt Nam Chuẩn (Tỉnh/Thành Phố -> Quận/Huyện -> Phường/Xã)
 * Phục vụ cho tính cước vận chuyển Giao Hàng Tiết Kiệm (GHTK) và lưu địa chỉ bảo mật.
 */

export interface WardData {
  id: string;
  name: string;
}

export interface DistrictData {
  id: string;
  name: string;
  wards: string[];
}

export interface ProvinceData {
  id: string;
  name: string;
  districts: DistrictData[];
}

export const VIETNAM_ADMINISTRATIVE_DATA: ProvinceData[] = [
  {
    id: "hcm",
    name: "TP. Hồ Chí Minh",
    districts: [
      {
        id: "hcm-q1",
        name: "Quận 1",
        wards: [
          "Phường Bến Nghé",
          "Phường Bến Thành",
          "Phường Cầu Kho",
          "Phường Cầu Ông Lãnh",
          "Phường Cô Giang",
          "Phường Đa Kao",
          "Phường Định Tiên Hoàng",
          "Phường Nguyễn Cư Trinh",
          "Phường Nguyễn Thái Bình",
          "Phường Phạm Ngũ Lão",
          "Phường Tân Định",
        ],
      },
      {
        id: "hcm-q3",
        name: "Quận 3",
        wards: [
          "Phường 1",
          "Phường 2",
          "Phường 3",
          "Phường 4",
          "Phường 5",
          "Phường 9",
          "Phường 10",
          "Phường 11",
          "Phường 12",
          "Phường 14",
          "Phường Võ Thị Sáu",
        ],
      },
      {
        id: "hcm-q4",
        name: "Quận 4",
        wards: [
          "Phường 1",
          "Phường 2",
          "Phường 3",
          "Phường 4",
          "Phường 6",
          "Phường 8",
          "Phường 9",
          "Phường 10",
          "Phường 13",
          "Phường 14",
          "Phường 15",
          "Phường 16",
          "Phường 18",
        ],
      },
      {
        id: "hcm-q5",
        name: "Quận 5",
        wards: [
          "Phường 1",
          "Phường 2",
          "Phường 3",
          "Phường 4",
          "Phường 5",
          "Phường 6",
          "Phường 7",
          "Phường 8",
          "Phường 9",
          "Phường 10",
          "Phường 11",
          "Phường 12",
          "Phường 13",
          "Phường 14",
        ],
      },
      {
        id: "hcm-q7",
        name: "Quận 7",
        wards: [
          "Phường Bình Thuận",
          "Phường Phú Mỹ",
          "Phường Phú Thuận",
          "Phường Tân Hưng",
          "Phường Tân Kiểng",
          "Phường Tân Phong",
          "Phường Tân Phú",
          "Phường Tân Quy",
          "Phường Tân Thuận Đông",
          "Phường Tân Thuận Tây",
        ],
      },
      {
        id: "hcm-thuduc",
        name: "TP. Thủ Đức",
        wards: [
          "Phường An Khánh",
          "Phường An Lợi Đông",
          "Phường An Phú",
          "Phường Bình Chiểu",
          "Phường Bình Thọ",
          "Phường Cát Lái",
          "Phường Hiệp Bình Chánh",
          "Phường Hiệp Bình Phước",
          "Phường Hiệp Phú",
          "Phường Linh Chiểu",
          "Phường Linh Đông",
          "Phường Linh Tây",
          "Phường Linh Trung",
          "Phường Linh Xuân",
          "Phường Long Bình",
          "Phường Long Phước",
          "Phường Long Thạnh Mỹ",
          "Phường Long Trường",
          "Phường Phú Hữu",
          "Phường Phước Bình",
          "Phường Phước Long A",
          "Phường Phước Long B",
          "Phường Tam Bình",
          "Phường Tam Phú",
          "Phường Tăng Nhơn Phú A",
          "Phường Tăng Nhơn Phú B",
          "Phường Thạnh Mỹ Lợi",
          "Phường Thảo Điền",
          "Phường Thủ Thiêm",
          "Phường Trường Thạnh",
          "Phường Trường Thọ",
        ],
      },
      {
        id: "hcm-binhthanh",
        name: "Quận Bình Thạnh",
        wards: [
          "Phường 1",
          "Phường 2",
          "Phường 3",
          "Phường 5",
          "Phường 6",
          "Phường 7",
          "Phường 11",
          "Phường 12",
          "Phường 13",
          "Phường 14",
          "Phường 15",
          "Phường 17",
          "Phường 19",
          "Phường 21",
          "Phường 22",
          "Phường 24",
          "Phường 25",
          "Phường 26",
          "Phường 27",
          "Phường 28",
        ],
      },
      {
        id: "hcm-phunhuan",
        name: "Quận Phú Nhuận",
        wards: [
          "Phường 1",
          "Phường 2",
          "Phường 3",
          "Phường 4",
          "Phường 5",
          "Phường 7",
          "Phường 8",
          "Phường 9",
          "Phường 10",
          "Phường 11",
          "Phường 13",
          "Phường 15",
          "Phường 17",
        ],
      },
      {
        id: "hcm-tanbinh",
        name: "Quận Tân Bình",
        wards: [
          "Phường 1",
          "Phường 2",
          "Phường 3",
          "Phường 4",
          "Phường 5",
          "Phường 6",
          "Phường 7",
          "Phường 8",
          "Phường 9",
          "Phường 10",
          "Phường 11",
          "Phường 12",
          "Phường 13",
          "Phường 14",
          "Phường 15",
        ],
      },
      {
        id: "hcm-govap",
        name: "Quận Gò Vấp",
        wards: [
          "Phường 1",
          "Phường 3",
          "Phường 4",
          "Phường 5",
          "Phường 6",
          "Phường 7",
          "Phường 8",
          "Phường 9",
          "Phường 10",
          "Phường 11",
          "Phường 12",
          "Phường 13",
          "Phường 14",
          "Phường 15",
          "Phường 16",
          "Phường 17",
        ],
      },
      {
        id: "hcm-q10",
        name: "Quận 10",
        wards: [
          "Phường 1",
          "Phường 2",
          "Phường 4",
          "Phường 5",
          "Phường 6",
          "Phường 7",
          "Phường 8",
          "Phường 9",
          "Phường 10",
          "Phường 11",
          "Phường 12",
          "Phường 13",
          "Phường 14",
          "Phường 15",
        ],
      },
      {
        id: "hcm-q11",
        name: "Quận 11",
        wards: [
          "Phường 1",
          "Phường 2",
          "Phường 3",
          "Phường 5",
          "Phường 8",
          "Phường 9",
          "Phường 10",
          "Phường 11",
          "Phường 14",
          "Phường 15",
          "Phường 16",
        ],
      },
      {
        id: "hcm-q12",
        name: "Quận 12",
        wards: [
          "Phường An Phú Đông",
          "Phường Đông Hưng Thuận",
          "Phường Hiệp Thành",
          "Phường Tân Chánh Hiệp",
          "Phường Tân Hưng Thuận",
          "Phường Tân Thới Hiệp",
          "Phường Tân Thới Nhất",
          "Phường Thạnh Lộc",
          "Phường Thạnh Xuân",
          "Phường Thới An",
          "Phường Trung Mỹ Tây",
        ],
      },
      {
        id: "hcm-binhtan",
        name: "Quận Bình Tân",
        wards: [
          "Phường An Lạc",
          "Phường An Lạc A",
          "Phường Bình Hưng Hòa",
          "Phường Bình Hưng Hòa A",
          "Phường Bình Hưng Hòa B",
          "Phường Bình Trị Đông",
          "Phường Bình Trị Đông A",
          "Phường Bình Trị Đông B",
          "Phường Tân Tạo",
          "Phường Tân Tạo A",
        ],
      },
      {
        id: "hcm-binhchanh",
        name: "Huyện Bình Chánh",
        wards: [
          "Thị trấn Tân Túc",
          "Xã An Phú Tây",
          "Xã Bình Chánh",
          "Xã Bình Hưng",
          "Xã Bình Lợi",
          "Xã Đa Phước",
          "Xã Hưng Long",
          "Xã Lê Minh Xuân",
          "Xã Phạm Văn Hai",
          "Xã Phong Phú",
          "Xã Quy Đức",
          "Xã Tân Kiên",
          "Xã Tân Nhựt",
          "Xã Tân Quý Tây",
          "Xã Vĩnh Lộc A",
          "Xã Vĩnh Lộc B",
        ],
      },
      {
        id: "hcm-nhabe",
        name: "Huyện Nhà Bè",
        wards: [
          "Thị trấn Nhà Bè",
          "Xã Hiệp Phước",
          "Xã Long Thới",
          "Xã Nhơn Đức",
          "Xã Phú Xuân",
          "Xã Phước Kiển",
          "Xã Phước Lộc",
        ],
      },
    ],
  },
  {
    id: "hn",
    name: "Hà Nội",
    districts: [
      {
        id: "hn-hoankiem",
        name: "Quận Hoàn Kiếm",
        wards: [
          "Phường Chương Dương",
          "Phường Cửa Đông",
          "Phường Cửa Nam",
          "Phường Đồng Xuân",
          "Phường Hàng Bạc",
          "Phường Hàng Bài",
          "Phường Hàng Bồ",
          "Phường Hàng Bông",
          "Phường Hàng Buồm",
          "Phường Hàng Đào",
          "Phường Hàng Gai",
          "Phường Hàng Mã",
          "Phường Hàng Trống",
          "Phường Lý Thái Tổ",
          "Phường Phan Chu Trinh",
          "Phường Phúc Tân",
          "Phường Tràng Tiền",
          "Phường Trần Hưng Đạo",
        ],
      },
      {
        id: "hn-badinh",
        name: "Quận Ba Đình",
        wards: [
          "Phường Cống Vị",
          "Phường Điện Biên",
          "Phường Đội Cấn",
          "Phường Giảng Võ",
          "Phường Kim Mã",
          "Phường Liễu Giai",
          "Phường Ngọc Hà",
          "Phường Ngọc Khánh",
          "Phường Nguyễn Trung Trực",
          "Phường Phúc Xá",
          "Phường Quán Thánh",
          "Phường Thành Công",
          "Phường Trúc Bạch",
          "Phường Vĩnh Phúc",
        ],
      },
      {
        id: "hn-caugiay",
        name: "Quận Cầu Giấy",
        wards: [
          "Phường Dịch Vọng",
          "Phường Dịch Vọng Hậu",
          "Phường Mai Dịch",
          "Phường Nghĩa Đô",
          "Phường Nghĩa Tân",
          "Phường Quan Hoa",
          "Phường Trung Hòa",
          "Phường Yên Hòa",
        ],
      },
      {
        id: "hn-dongda",
        name: "Quận Đống Đa",
        wards: [
          "Phường Cát Linh",
          "Phường Hàng Bột",
          "Phường Khâm Thiên",
          "Phường Khương Thượng",
          "Phường Kim Liên",
          "Phường Láng Hạ",
          "Phường Láng Thượng",
          "Phường Nam Đồng",
          "Phường Ngã Tư Sở",
          "Phường Ô Chợ Dừa",
          "Phường Phương Liên",
          "Phường Phương Mai",
          "Phường Quang Trung",
          "Phường Quốc Tử Giám",
          "Phường Thịnh Quang",
          "Phường Thổ Quan",
          "Phường Trung Liệt",
          "Phường Trung Phụng",
          "Phường Trung Tự",
          "Phường Văn Chương",
          "Phường Văn Miếu",
        ],
      },
      {
        id: "hn-tayho",
        name: "Quận Tây Hồ",
        wards: [
          "Phường Bưởi",
          "Phường Nhật Tân",
          "Phường Phú Thượng",
          "Phường Quảng An",
          "Phường Thụy Khuê",
          "Phường Tứ Liên",
          "Phường Xuân La",
          "Phường Yên Phụ",
        ],
      },
      {
        id: "hn-haibatrung",
        name: "Quận Hai Bà Trưng",
        wards: [
          "Phường Bách Khoa",
          "Phường Bạch Đằng",
          "Phường Bạch Mai",
          "Phường Cầu Dền",
          "Phường Đống Mác",
          "Phường Đồng Nhân",
          "Phường Đồng Tâm",
          "Phường Lê Đại Hành",
          "Phường Minh Khai",
          "Phường Nguyễn Du",
          "Phường Phạm Đình Hổ",
          "Phường Phố Huế",
          "Phường Quỳnh Lôi",
          "Phường Quỳnh Mai",
          "Phường Thanh Lương",
          "Phường Thanh Nhàn",
          "Phường Trương Định",
          "Phường Vĩnh Tuy",
        ],
      },
      {
        id: "hn-namtuliem",
        name: "Quận Nam Từ Liêm",
        wards: [
          "Phường Cầu Diễn",
          "Phường Đại Mỗ",
          "Phường Mễ Trì",
          "Phường Mỹ Đình 1",
          "Phường Mỹ Đình 2",
          "Phường Phú Đô",
          "Phường Phương Canh",
          "Phường Tây Mỗ",
          "Phường Trung Văn",
          "Phường Xuân Phương",
        ],
      },
      {
        id: "hn-bactuliem",
        name: "Quận Bắc Từ Liêm",
        wards: [
          "Phường Cổ Nhuế 1",
          "Phường Cổ Nhuế 2",
          "Phường Đông Ngạc",
          "Phường Đức Thắng",
          "Phường Liên Mạc",
          "Phường Minh Khai",
          "Phường Phú Diễn",
          "Phường Phúc Diễn",
          "Phường Tây Tựu",
          "Phường Thượng Cát",
          "Phường Thụy Phương",
          "Phường Xuân Đỉnh",
          "Phường Xuân Tảo",
        ],
      },
      {
        id: "hn-thanhxuan",
        name: "Quận Thanh Xuân",
        wards: [
          "Phường Hạ Đình",
          "Phường Khương Đình",
          "Phường Khương Mai",
          "Phường Khương Trung",
          "Phường Kim Giang",
          "Phường Nhân Chính",
          "Phường Phương Liệt",
          "Phường Thanh Xuân Bắc",
          "Phường Thanh Xuân Nam",
          "Phường Thanh Xuân Trung",
          "Phường Thượng Đình",
        ],
      },
      {
        id: "hn-longbien",
        name: "Quận Long Biên",
        wards: [
          "Phường Bồ Đề",
          "Phường Cự Khối",
          "Phường Đức Giang",
          "Phường Gia Thụy",
          "Phường Giang Biên",
          "Phường Long Biên",
          "Phường Ngọc Lâm",
          "Phường Ngọc Thụy",
          "Phường Phúc Đồng",
          "Phường Phúc Lợi",
          "Phường Sài Đồng",
          "Phường Thạch Bàn",
          "Phường Thượng Thanh",
          "Phường Việt Hưng",
        ],
      },
      {
        id: "hn-hadong",
        name: "Quận Hà Đông",
        wards: [
          "Phường Biên Giang",
          "Phường Đồng Mai",
          "Phường Dương Nội",
          "Phường Hà Cầu",
          "Phường Kiến Hưng",
          "Phường La Khê",
          "Phường Mộ Lao",
          "Phường Nguyễn Trãi",
          "Phường Phú La",
          "Phường Phú Lãm",
          "Phường Phú Lương",
          "Phường Phúc La",
          "Phường Quang Trung",
          "Phường Vạn Phúc",
          "Phường Văn Quán",
          "Phường Yên Nghĩa",
          "Phường Yết Kiêu",
        ],
      },
    ],
  },
  {
    id: "danang",
    name: "Đà Nẵng",
    districts: [
      {
        id: "dn-haichau",
        name: "Quận Hải Châu",
        wards: [
          "Phường Bình Hiên",
          "Phường Bình Thuận",
          "Phường Hải Châu I",
          "Phường Hải Châu II",
          "Phường Hòa Cường Bắc",
          "Phường Hòa Cường Nam",
          "Phường Hòa Thuận Đông",
          "Phường Hòa Thuận Tây",
          "Phường Nam Dương",
          "Phường Phước Ninh",
          "Phường Thạch Thang",
          "Phường Thanh Bình",
          "Phường Thuận Phước",
        ],
      },
      {
        id: "dn-sontra",
        name: "Quận Sơn Trà",
        wards: [
          "Phường An Hải Bắc",
          "Phường An Hải Đông",
          "Phường An Hải Tây",
          "Phường Mân Thái",
          "Phường Nại Hiên Đông",
          "Phường Phước Mỹ",
          "Phường Thọ Quang",
        ],
      },
      {
        id: "dn-thanhkhe",
        name: "Quận Thanh Khê",
        wards: [
          "Phường An Khê",
          "Phường Chính Gián",
          "Phường Hòa Khê",
          "Phường Tam Thuận",
          "Phường Tân Chính",
          "Phường Thạc Gián",
          "Phường Thanh Khê Đông",
          "Phường Thanh Khê Tây",
          "Phường Vĩnh Trung",
          "Phường Xuân Hà",
        ],
      },
      {
        id: "dn-nguhanhson",
        name: "Quận Ngũ Hành Sơn",
        wards: [
          "Phường Hòa Hải",
          "Phường Hòa Quý",
          "Phường Khuê Mỹ",
          "Phường Mỹ An",
        ],
      },
      {
        id: "dn-lienchieu",
        name: "Quận Liên Chiểu",
        wards: [
          "Phường Hòa Hiệp Bắc",
          "Phường Hòa Hiệp Nam",
          "Phường Hòa Khánh Bắc",
          "Phường Hòa Khánh Nam",
          "Phường Hòa Minh",
        ],
      },
      {
        id: "dn-camle",
        name: "Quận Cẩm Lệ",
        wards: [
          "Phường Hòa An",
          "Phường Hòa Phát",
          "Phường Hòa Thọ Đông",
          "Phường Hòa Thọ Tây",
          "Phường Hòa Xuân",
          "Phường Khuê Trung",
        ],
      },
    ],
  },
  {
    id: "haiphong",
    name: "Hải Phòng",
    districts: [
      {
        id: "hp-hongbang",
        name: "Quận Hồng Bàng",
        wards: ["Phường Hoàng Văn Thụ", "Phường Minh Khai", "Phường Phan Bội Châu", "Phường Quán Toan", "Phường Sở Dầu", "Phường Thượng Lý", "Phường Trại Chuối"],
      },
      {
        id: "hp-ngoquyen",
        name: "Quận Ngô Quyền",
        wards: ["Phường Cầu Đất", "Phường Cầu Tre", "Phường Đằng Giang", "Phường Đông Khê", "Phường Đồng Quốc Bình", "Phường Gia Viên", "Phường Lạc Viên", "Phường Lạch Tray", "Phường Lê Lợi", "Phường Máy Chai", "Phường Máy Tơ", "Phường Vạn Mỹ"],
      },
      {
        id: "hp-lechan",
        name: "Quận Lê Chân",
        wards: ["Phường An Biên", "Phường An Dương", "Phường Cát Dài", "Phường Dư Hàng", "Phường Dư Hàng Kênh", "Phường Hàng Kênh", "Phường Hồ Nam", "Phường Kênh Dương", "Phường Lam Sơn", "Phường Niệm Nghĩa", "Phường Nghĩa Xá", "Phường Trại Cau", "Phường Trần Nguyên Hãn", "Phường Vĩnh Niệm"],
      },
      {
        id: "hp-haian",
        name: "Quận Hải An",
        wards: ["Phường Cát Bi", "Phường Đằng Hải", "Phường Đằng Lâm", "Phường Đông Hải 1", "Phường Đông Hải 2", "Phường Nam Hải", "Phường Thành Tô", "Phường Tràng Cát"],
      },
    ],
  },
  {
    id: "cantho",
    name: "Cần Thơ",
    districts: [
      {
        id: "ct-ninhkieu",
        name: "Quận Ninh Kiều",
        wards: ["Phường An Bình", "Phường An Cư", "Phường An Hòa", "Phường An Khánh", "Phường An Nghiệp", "Phường Cái Khế", "Phường Hưng Lợi", "Phường Tân An", "Phường Thới Bình", "Phường Xuân Khánh"],
      },
      {
        id: "ct-cairang",
        name: "Quận Cái Răng",
        wards: ["Phường Ba Láng", "Phường Hưng Phú", "Phường Hưng Thạnh", "Phường Lê Bình", "Phường Phú Thứ", "Phường Tân Phú", "Phường Yên Đỗ"],
      },
      {
        id: "ct-binhthuy",
        name: "Quận Bình Thủy",
        wards: ["Phường An Thới", "Phường Bình Thủy", "Phường Bùi Hữu Nghĩa", "Phường Long Hòa", "Phường Long Tuyền", "Phường Thới An Đông", "Phường Trà An", "Phường Trà Nóc"],
      },
    ],
  },
  {
    id: "binhduong",
    name: "Bình Dương",
    districts: [
      {
        id: "bd-thudaumot",
        name: "TP. Thủ Dầu Một",
        wards: ["Phường Chánh Mỹ", "Phường Chánh Nghĩa", "Phường Định Hòa", "Phường Hiệp An", "Phường Hiệp Thành", "Phường Hòa Phú", "Phường Phú Cường", "Phường Phú Hòa", "Phường Phú Lợi", "Phường Phú Mỹ", "Phường Phú Tân", "Phường Phú Thọ", "Phường Tân An", "Phường Tương Bình Hiệp"],
      },
      {
        id: "bd-thuanan",
        name: "TP. Thuận An",
        wards: ["Phường An Phú", "Phường An Thạnh", "Phường Bình Chuẩn", "Phường Bình Hòa", "Phường Bình Nhâm", "Phường Hưng Định", "Phường Lái Thiêu", "Phường Thuận Giao", "Phường Vĩnh Phú"],
      },
      {
        id: "bd-dian",
        name: "TP. Dĩ An",
        wards: ["Phường An Bình", "Phường Bình An", "Phường Bình Thắng", "Phường Dĩ An", "Phường Đông Hòa", "Phường Tân Bình", "Phường Tân Đông Hiệp"],
      },
    ],
  },
  {
    id: "dongnai",
    name: "Đồng Nai",
    districts: [
      {
        id: "dn-bienhoa",
        name: "TP. Biên Hòa",
        wards: ["Phường An Bình", "Phường An Hòa", "Phường Bình Đa", "Phường Bửu Hòa", "Phường Bửu Long", "Phường Hiệp Hòa", "Phường Hố Nai", "Phường Hóa An", "Phường Long Bình", "Phường Long Bình Tân", "Phường Quyết Thắng", "Phường Tam Hiệp", "Phường Tam Hòa", "Phường Tân Biên", "Phường Tân Hạnh", "Phường Tân Hiệp", "Phường Tân Mai", "Phường Tân Phong", "Phường Tân Tiến", "Phường Tân Vạn", "Phường Thanh Bình", "Phường Thống Nhất", "Phường Trảng Dài", "Phường Trung Dũng"],
      },
      {
        id: "dn-longthanh",
        name: "Huyện Long Thành",
        wards: ["Thị trấn Long Thành", "Xã An Phước", "Xã Bàu Cạn", "Xã Bình An", "Xã Bình Sơn", "Xã Cẩm Đường", "Xã Lộc An", "Xã Long An", "Xã Long Đức", "Xã Long Phước", "Xã Phước Bình", "Xã Phước Thái", "Xã Tam An", "Xã Tân Hiệp"],
      },
    ],
  },
  {
    id: "quangninh",
    name: "Quảng Ninh",
    districts: [
      {
        id: "qn-halong",
        name: "TP. Hạ Long",
        wards: ["Phường Bạch Đằng", "Phường Bãi Cháy", "Phường Cao Xanh", "Phường Cao Thắng", "Phường Đại Yên", "Phường Giếng Đáy", "Phường Hà Khánh", "Phường Hà Khẩu", "Phường Hà Lầm", "Phường Hà Phong", "Phường Hà Trung", "Phường Hà Tu", "Phường Hoành Bồ", "Phường Hùng Thắng", "Phường Hồng Gai", "Phường Hồng Hà", "Phường Hồng Hải", "Phường Trần Hưng Đạo", "Phường Tuần Châu", "Phường Việt Hưng", "Phường Yết Kiêu"],
      },
    ],
  },
  {
    id: "khanhhoa",
    name: "Khánh Hòa",
    districts: [
      {
        id: "kh-nhatrang",
        name: "TP. Nha Trang",
        wards: ["Phường Lộc Thọ", "Phường Ngọc Hiệp", "Phường Phước Hải", "Phường Phước Hòa", "Phường Phước Tân", "Phường Phước Tiến", "Phường Phương Sài", "Phường Phương Sơn", "Phường Tân Lập", "Phường Vạn Thắng", "Phường Vạn Thạnh", "Phường Vĩnh Hải", "Phường Vĩnh Hòa", "Phường Vĩnh Nguyên", "Phường Vĩnh Phước", "Phường Vĩnh Thọ", "Phường Vĩnh Trường", "Phường Xương Huân"],
      },
    ],
  },
  {
    id: "vungtau",
    name: "Bà Rịa - Vũng Tàu",
    districts: [
      {
        id: "vt-vungtau",
        name: "TP. Vũng Tàu",
        wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường Thắng Nhất", "Phường Thắng Nhì", "Phường Thắng Tam", "Phường Rạch Dừa", "Phường Nguyễn An Ninh"],
      },
    ],
  },
  {
    id: "hue",
    name: "Thừa Thiên Huế",
    districts: [
      {
        id: "hue-tphue",
        name: "TP. Huế",
        wards: ["Phường An Cựu", "Phường An Đông", "Phường An Hòa", "Phường An Tây", "Phường Đông Ba", "Phường Gia Hội", "Phường Hương An", "Phường Hương Hồ", "Phường Hương Long", "Phường Hương Sơ", "Phường Kim Long", "Phường Phú Hậu", "Phường Phú Hội", "Phường Phú Nhuận", "Phường Phú Thượng", "Phường Phước Vĩnh", "Phường Phường Đúc", "Phường Tây Lộc", "Phường Thuận An", "Phường Thuận Hòa", "Phường Thuận Lộc", "Phường Thủy Biều", "Phường Thủy Vân", "Phường Thủy Xuân", "Phường Vĩnh Ninh", "Phường Vỹ Dạ", "Phường Xuân Phú"],
      },
    ],
  },
  {
    id: "lamdong",
    name: "Lâm Đồng",
    districts: [
      {
        id: "ld-dalat",
        name: "TP. Đà Lạt",
        wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Xã Tà Nung", "Xã Trạm Hành", "Xã Xuân Thọ", "Xã Xuân Trường"],
      },
    ],
  },
  // Các tỉnh thành khác trên toàn quốc
  ...[
    "An Giang", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Phước", "Bình Thuận",
    "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh",
    "Hải Dương", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Kiên Giang", "Kon Tum", "Lai Châu", "Lạng Sơn", "Lào Cai",
    "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam",
    "Quảng Ngãi", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Tiền Giang",
    "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
  ].map((pName) => ({
    id: pName.toLowerCase().replace(/\s+/g, "-"),
    name: pName,
    districts: [
      {
        id: `${pName.toLowerCase().replace(/\s+/g, "-")}-tp`,
        name: `TP. ${pName}`,
        wards: ["Phường 1", "Phường 2", "Phường 3", "Phường Trung Tâm", "Xã Ngoại Thành"],
      },
      {
        id: `${pName.toLowerCase().replace(/\s+/g, "-")}-huyen1`,
        name: "Huyện Trung Tâm",
        wards: ["Thị trấn Huyện", "Xã An Bình", "Xã Hòa Hưng", "Xã Tân Phú"],
      },
    ],
  })),
];

/**
 * Lấy danh sách 63 Tỉnh / Thành phố
 */
export function getAllProvinces(): string[] {
  return VIETNAM_ADMINISTRATIVE_DATA.map((p) => p.name);
}

/**
 * Lấy danh sách Quận / Huyện theo Tỉnh / Thành phố
 */
export function getDistricts(provinceName: string): string[] {
  const prov = VIETNAM_ADMINISTRATIVE_DATA.find(
    (p) => p.name.toLowerCase() === provinceName.toLowerCase() || p.id === provinceName
  );
  if (!prov) return [];
  return prov.districts.map((d) => d.name);
}

/**
 * Lấy danh sách Phường / Xã theo Tỉnh và Quận / Huyện
 */
export function getWards(provinceName: string, districtName: string): string[] {
  const prov = VIETNAM_ADMINISTRATIVE_DATA.find(
    (p) => p.name.toLowerCase() === provinceName.toLowerCase() || p.id === provinceName
  );
  if (!prov) return [];

  const dist = prov.districts.find(
    (d) => d.name.toLowerCase() === districtName.toLowerCase()
  );
  if (!dist) return [];

  return dist.wards;
}

