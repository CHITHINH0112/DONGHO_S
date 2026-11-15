import express from 'express';
import {
  getStaffList,
  createStaff,
  updateStaff,
  openShift,
  closeShift,
  getShifts,
  createApproval,
  processApproval,
  getApprovals,
  getAuditLogs,
} from '../controllers/admin.controller.js';
import { verifyToken, authorizeRoles, authorizePositions } from '../middlewares/auth.middleware.js';
import { requireFields } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Toàn bộ route admin đều yêu cầu token role staff hoặc admin
router.use(verifyToken);
router.use(authorizeRoles('admin', 'staff'));

// Quản lý nhân sự (Chỉ admin / manager)
router.get('/staff', authorizePositions('manager'), getStaffList);
router.post('/staff', authorizePositions('manager'), requireFields('name', 'email', 'staffCode'), createStaff);
router.put('/staff/:id', authorizePositions('manager'), updateStaff);

// Quản lý ca thu ngân
router.get('/shifts', getShifts);
router.post('/shifts/open', requireFields('tienMatDemDuocKhiNhanCa'), openShift);
router.put('/shifts/:shiftId/close', requireFields('tienPhaiCoKhiChotCa'), closeShift);

// Quản lý phiếu phê duyệt (Hủy đơn, giảm giá...)
router.get('/approvals', getApprovals);
router.post('/approvals', requireFields('requestType', 'idBangLienQuan', 'reason'), createApproval);
router.put('/approvals/:id/process', authorizePositions('manager'), requireFields('status'), processApproval);

// Xem nhật ký kiểm toán (Manager only)
router.get('/audit-logs', authorizePositions('manager'), getAuditLogs);

export default router;
