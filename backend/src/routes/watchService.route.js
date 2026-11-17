import express from 'express';
import {
  getServices,
  createService,
  updateService,
  getRepairTickets,
  createRepairTicket,
  updateTicketStatus,
  cancelRepairTicket,
} from '../controllers/watchService.controller.js';
import { verifyToken, authorizeRoles, authorizePositions } from '../middlewares/auth.middleware.js';
import { requireFields } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Bảng giá dịch vụ là công khai
router.get('/', getServices);

// Quản lý bảng giá (Admin / Manager)
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'technician'),
  requireFields('name', 'serviceType', 'basePrice'),
  createService
);

router.put(
  '/:id',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'technician'),
  updateService
);

// Quản lý phiếu sửa chữa (Yêu cầu đăng nhập)
router.get('/repairs/tickets', verifyToken, getRepairTickets);

router.post(
  '/repairs/tickets',
  verifyToken,
  requireFields('serviceId'),
  createRepairTicket
);

router.put(
  '/repairs/tickets/:id/cancel',
  verifyToken,
  cancelRepairTicket
);

router.put(
  '/repairs/tickets/:id/status',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'technician'),
  requireFields('status'),
  updateTicketStatus
);

export default router;
