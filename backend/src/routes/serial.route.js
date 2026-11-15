import express from 'express';
import multer from 'multer';
import {
  downloadSerialTemplate,
  importSerialsFromExcel,
  getSerialNumbers,
  getPendingWarehouseChecks,
  confirmWarehouseSerials,
  reportSerialDiscrepancy,
  getSerialAlerts,
} from '../controllers/serial.controller.js';
import { verifyToken, authorizeRoles, authorizePositions } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Cấu hình Multer lưu file trong RAM để đọc buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Tối đa 10MB
  fileFilter: (req, file, cb) => {
    const isExcel =
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.match(/\.(xlsx|xls|csv)$/i);

    if (isExcel) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc file .csv'));
    }
  },
});

// Tải file mẫu Excel (Chỉ yêu cầu đăng nhập)
router.get(
  '/template',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  downloadSerialTemplate
);

// Admin tải file Excel chứa SKU và danh sách Seri (Chỉ Quản lý / Admin)
router.post(
  '/import-excel',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager'),
  upload.single('file'),
  importSerialsFromExcel
);

// Lấy danh sách số serial (Admin / Kho / Bán hàng xem)
router.get(
  '/',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  getSerialNumbers
);

// Lấy danh sách hàng đang chờ nhân viên kho kiểm tra
router.get(
  '/pending-check',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  getPendingWarehouseChecks
);

// Nhân viên kho bấm xác nhận lô hàng đạt chuẩn -> chuyển sang available
router.put(
  '/warehouse-confirm',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'warehouse'),
  // authorizeRoles('staff'),
  // authorizePositions('manager', 'warehouse'),
  confirmWarehouseSerials
);

// Nhân viên kho báo cáo phát hiện sai lệch (thiếu hàng / máy lỗi)
router.put(
  '/report-discrepancy',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'warehouse'),
  reportSerialDiscrepancy
);

// Lấy danh sách cảnh báo sự cố kho (hàng lỗi / thiếu) cho Admin (Chuông thông báo)
router.get(
  '/alerts',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  getSerialAlerts
);

export default router;

