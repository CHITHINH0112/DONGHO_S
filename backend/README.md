# Luxury Watch Backend API (Database: dongho_shop)

Hệ thống Backend RESTful API hoàn chỉnh xây dựng bằng **Node.js Express** và **Sequelize ORM** kết nối **MySQL localhost**, đã đồng bộ toàn diện tất cả các tầng (**Models**, **Middlewares**, **Services**, **Controllers**, **Routers**) theo cấu trúc nghiệp vụ 26 bảng của cơ sở dữ liệu `dongho_shop`.

---

## 🏛️ Kiến Trúc Hệ Thống (Clean Architecture)

```text
backend/
├── src/
│   ├── config/
│   │   └── database.js               # Kết nối Sequelize ORM & tự động tạo DB dongho_shop
│   ├── middlewares/
│   │   ├── audit.middleware.js       # Tự động ghi nhật ký hệ thống vào audit_logs
│   │   ├── auth.middleware.js        # Xác thực JWT & phân quyền Role / Position
│   │   ├── error.middleware.js       # Xử lý 404 và Global Error Handler
│   │   └── validate.middleware.js    # Kiểm tra trường dữ liệu đầu vào
│   ├── models/                       # Đầy đủ 26 Models + Associations chuẩn 100% SQL dump
│   │   ├── admin.model.js
│   │   ├── approvalRequest.model.js
│   │   ├── auditLog.model.js
│   │   ├── banner.model.js
│   │   ├── brand.model.js
│   │   ├── cart.model.js
│   │   ├── cartItem.model.js
│   │   ├── cashierShift.model.js
│   │   ├── category.model.js
│   │   ├── feature.model.js
│   │   ├── index.js
│   │   ├── order.model.js
│   │   ├── orderItem.model.js
│   │   ├── orderItemSerial.model.js
│   │   ├── orderReturn.model.js
│   │   ├── product.model.js
│   │   ├── productFeature.model.js
│   │   ├── productVariant.model.js
│   │   ├── productVariantImage.model.js
│   │   ├── repairTicket.model.js
│   │   ├── serialNumber.model.js
│   │   ├── shipment.model.js
│   │   ├── user.model.js
│   │   ├── userAddress.model.js
│   │   ├── warranty.model.js
│   │   ├── warrantyClaim.model.js
│   │   └── watchService.model.js
│   ├── services/                     # Tầng xử lý nghiệp vụ (Business Logic)
│   │   ├── admin.service.js          # Quản lý ca thu ngân, duyệt đơn, nhân sự
│   │   ├── auth.service.js           # Đăng ký, đăng nhập User & Admin
│   │   ├── banner.service.js         # Banner quảng cáo & slider
│   │   ├── brand.service.js          # Thương hiệu đồng hồ
│   │   ├── cart.service.js           # Giỏ hàng & biến thể sản phẩm
│   │   ├── category.service.js       # Danh mục phân cấp cha-con
│   │   ├── order.service.js          # Đơn hàng, vận đơn & đổi trả theo serial
│   │   ├── product.service.js        # Sản phẩm, biến thể SKU, lọc nâng cao
│   │   ├── userAddress.service.js    # Sổ địa chỉ giao hàng của khách
│   │   ├── warranty.service.js       # Tra cứu & xử lý bảo hành điện tử
│   │   └── watchService.service.js   # Bảng giá dịch vụ kỹ thuật & sửa chữa
│   ├── controllers/                  # Tầng tiếp nhận request & trả về response
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js
│   │   ├── banner.controller.js
│   │   ├── brand.controller.js
│   │   ├── cart.controller.js
│   │   ├── category.controller.js
│   │   ├── order.controller.js
│   │   ├── product.controller.js
│   │   ├── userAddress.controller.js
│   │   ├── warranty.controller.js
│   │   └── watchService.controller.js
│   ├── routes/                       # Tầng định tuyến API RESTful v1
│   │   ├── admin.route.js            # /api/v1/admin
│   │   ├── auth.route.js             # /api/v1/auth
│   │   ├── banner.route.js           # /api/v1/banners
│   │   ├── brand.route.js            # /api/v1/brands
│   │   ├── cart.route.js             # /api/v1/cart
│   │   ├── category.route.js         # /api/v1/categories
│   │   ├── index.js                  # Gắn kết toàn bộ routes & /health
│   │   ├── order.route.js            # /api/v1/orders
│   │   ├── product.route.js          # /api/v1/products
│   │   ├── userAddress.route.js      # /api/v1/user-addresses
│   │   ├── warranty.route.js         # /api/v1/warranties
│   │   ├── watch.route.js            # /api/v1/watches (tương thích ngược)
│   │   └── watchService.route.js     # /api/v1/services
│   ├── seeders/
│   │   └── seedDatabase.js           # Nạp sẵn dữ liệu chuẩn từ SQL dump
│   ├── utils/
│   │   ├── apiResponse.js
│   │   └── asyncHandler.js
│   └── app.js                        # Cấu hình Express app
├── server.js                         # Entry Point
├── .env
├── .env.example
├── .gitignore
└── package.json
```

---

## 📡 Danh Sách API Endpoints (v1)

### 1. 🏥 Health & System
- `GET /api/v1/health`: Kiểm tra uptime, trạng thái MySQL và danh sách phân hệ đang hoạt động.

### 2. 🔐 Authentication (`/api/v1/auth`)
- `POST /register`: Đăng ký tài khoản khách hàng mới.
- `POST /login`: Đăng nhập (hỗ trợ cả Khách hàng và Nhân viên Admin/Staff).
- `GET /me`: Lấy thông tin tài khoản đang đăng nhập *(Yêu cầu Bearer Token)*.

### 3. ⌚ Sản Phẩm & Biến Thể (`/api/v1/products` & `/api/v1/watches`)
- `GET /`: Danh sách sản phẩm (hỗ trợ lọc: `brandId`, `categoryId`, `gender`, `loaiBoMay`, `priceMin`, `priceMax`, `search`, phân trang `page`, `limit`).
- `GET /:idOrSlug`: Chi tiết sản phẩm kèm các biến thể (SKU, màu mặt, dây đeo), thư viện ảnh và tình trạng Serial kho.
- `POST /`: Tạo mới sản phẩm *(Admin / Nhân viên Kho)*.
- `PUT /:id`: Cập nhật sản phẩm *(Admin / Nhân viên Kho)*.
- `DELETE /:id`: Xóa sản phẩm *(Admin)*.
- `POST /:id/variants`: Thêm biến thể SKU mới cho sản phẩm *(Admin / Kho)*.

### 4. 🏷️ Danh Mục & Thương Hiệu
- `GET /api/v1/categories`: Lấy cây danh mục sản phẩm phân cấp cha-con.
- `GET /api/v1/categories/:idOrSlug`: Chi tiết danh mục kèm danh mục con và sản phẩm.
- `GET /api/v1/brands`: Danh sách thương hiệu (Casio, Seiko, Tissot...).
- `GET /api/v1/brands/:idOrSlug`: Chi tiết thương hiệu.

### 5. 🖼️ Banners (`/api/v1/banners`)
- `GET /`: Lấy danh sách banner slider trang chủ đang active (`?position=slider_home`).

### 6. 🛒 Giỏ Hàng (`/api/v1/cart`)
*(Yêu cầu Bearer Token)*
- `GET /`: Lấy giỏ hàng của tài khoản kèm tổng số lượng và tổng tiền.
- `POST /items`: Thêm biến thể (`variantId`, `quantity`) vào giỏ hàng.
- `PUT /items/:itemId`: Cập nhật số lượng sản phẩm.
- `DELETE /items/:itemId`: Xóa một sản phẩm khỏi giỏ hàng.
- `DELETE /`: Xóa toàn bộ giỏ hàng.

### 7. 📦 Đơn Hàng, Vận Đơn & Đổi Trả (`/api/v1/orders`)
*(Yêu cầu Bearer Token)*
- `POST /`: Tạo đơn hàng mới từ giỏ hàng hoặc danh sách items.
- `GET /`: Danh sách đơn hàng (Khách hàng xem đơn của mình; Staff/Admin xem toàn bộ).
- `GET /:id`: Chi tiết đơn hàng kèm danh sách Serial máy, vận đơn và đổi trả.
- `POST /:id/returns`: Tạo phiếu yêu cầu đổi/trả đồng hồ theo số Serial máy cũ.
- `PUT /:id/status`: Cập nhật trạng thái đơn hàng (`pending`, `confirmed`, `packing`, `shipping`, `completed`, `cancelled`) *(Sales / Warehouse)*.
- `PUT /:id/shipment`: Cập nhật mã vận đơn hãng giao hàng (GHN, GHTK...), tiền COD *(Warehouse)*.

### 8. 📍 Sổ Địa Chỉ Giao Hàng (`/api/v1/user-addresses`)
*(Yêu cầu Bearer Token)*
- `GET /`: Danh sách địa chỉ nhận hàng của khách.
- `POST /`: Thêm địa chỉ mới (`isDefault`, `address`, `phone`, `receiverName`).
- `PUT /:id`: Cập nhật địa chỉ.
- `DELETE /:id`: Xóa địa chỉ.

### 9. 🛡️ Bảo Hành & Sửa Chữa
- `GET /api/v1/warranties/check/:code`: Tra cứu thông tin bảo hành điện tử công khai qua mã thẻ hoặc số Serial máy.
- `POST /api/v1/warranties`: Kích hoạt/tạo thẻ bảo hành điện tử *(Staff)*.
- `GET /api/v1/warranties/claims`: Danh sách yêu cầu bảo hành.
- `POST /api/v1/warranties/claims`: Tiếp nhận xử lý bảo hành máy.
- `GET /api/v1/services`: Bảng giá dịch vụ sửa chữa công khai (thay pin, thay dây, lau dầu, chống nước...).
- `GET /api/v1/services/repairs/tickets`: Danh sách phiếu sửa chữa đồng hồ.
- `POST /api/v1/services/repairs/tickets`: Lập phiếu tiếp nhận sửa chữa theo số Serial máy.
- `PUT /api/v1/services/repairs/tickets/:id/status`: Cập nhật tiến độ sửa chữa (`inspecting`, `in_progress`, `completed`, `delivered`) *(Thợ kỹ thuật)*.

### 10. 💼 Vận Hành & Quản Trị Cửa Hàng (`/api/v1/admin`)
*(Yêu cầu Bearer Token Admin / Staff)*
- `GET /staff`: Danh sách nhân viên và chức vụ *(Manager)*.
- `POST /staff`: Tạo tài khoản nhân viên mới *(Manager)*.
- `GET /shifts`: Danh sách ca trực thu ngân.
<!-- - `POST /shifts/open`: Mở ca thu ngân, nhập số tiền mặt đếm được khi nhận ca. -->
<!-- - `PUT /shifts/:shiftId/close`: Chốt và kết thúc ca thu ngân, kiểm kê số tiền chốt ca. -->



- `GET /shifts`: Danh sách lịch sử ca trực và trạng thái đối soát quỹ *(Manager / Cashier)*.
- `GET /shifts/current`: Lấy thông tin ca hiện tại của quầy (đang chờ confirm hoặc đang mở) *(Cashier)*.
- `POST /shifts`: Admin/Quản lý tạo ca mới và giao tiền quỹ (`cashierId`, `tienGiaoDauCa`) -> Trạng thái: `opening_cash_status = 'pending'` *(Admin / Manager)*.
- `PUT /shifts/:shiftId/confirm`: Thu ngân đếm két và xác nhận nhận ca (`tienMatDemDuocKhiNhanCa`, `note`) -> Tự động so khớp đổi sang `confirmed` hoặc `discrepancy` và kích hoạt ca sang `open` *(Cashier)*.
- `PUT /shifts/:shiftId/close`: Chốt ca thu ngân. Thu ngân gửi số `tienMatDemDuocKhiChotCa` để đối soát với `Tien_Phai_Co_Khi_Chot_Ca`, chuyển trạng thái sang `closed` *(Cashier)*.


- `GET /approvals`: Danh sách yêu cầu phê duyệt (hủy đơn, chiết khấu vượt mức, chênh lệch kho).
- `POST /approvals`: Tạo phiếu yêu cầu phê duyệt.
- `PUT /approvals/:id/process`: Duyệt / từ chối phiếu yêu cầu *(Manager)*.
- `GET /audit-logs`: Xem nhật ký kiểm toán hệ thống *(Manager)*.

---

## 🚀 Khởi Chạy

```bash
cd backend
npm run seed  # Nạp dữ liệu mẫu
npm run dev   # Khởi chạy dev server
```
Server sẽ chạy tại `http://localhost:5000`.
