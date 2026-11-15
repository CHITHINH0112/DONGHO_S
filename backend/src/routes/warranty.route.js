import express from 'express';
import {
  checkWarranty,
  getAllWarranties,
  createWarranty,
  getClaims,
  createClaim,
  updateClaimStatus,
} from '../controllers/warranty.controller.js';
import { verifyToken, authorizeRoles, authorizePositions } from '../middlewares/auth.middleware.js';
import { requireFields } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Tra cứu bảo hành công khai (khách tra theo serial hoặc mã thẻ)
router.get('/check/:code', checkWarranty);

// Lấy danh sách toàn bộ thẻ bảo hành điện tử (Staff / Admin)
router.get(
  '/',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  getAllWarranties
);

// Tạo thẻ bảo hành khi xuất xưởng/bán hàng (Staff / Admin)
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  requireFields('serialNumberId', 'cardCode', 'startDate', 'ngayHetBaoHanh'),
  createWarranty
);

// Quản lý yêu cầu bảo hành
router.get('/claims', verifyToken, getClaims);

router.post(
  '/claims',
  verifyToken,
  requireFields('serialNumberId', 'issueDescription'),
  createClaim
);

router.put(
  '/claims/:id/status',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'technician'),
  requireFields('status'),
  updateClaimStatus
);

export default router;
