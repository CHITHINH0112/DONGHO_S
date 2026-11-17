import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderDetail,
  updateOrderStatus,
  requestOrderReturn,
  updateShipment,
  retryOrderPayment,
  cancelOrder,
} from '../controllers/order.controller.js';
import { verifyToken, authorizeRoles, authorizePositions } from '../middlewares/auth.middleware.js';
import { requireFields } from '../middlewares/validate.middleware.js';

const router = express.Router();

router.use(verifyToken);

// Khách hàng và Admin đều có thể tạo và xem đơn
router.post('/', requireFields('items'), createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderDetail);
router.post('/:id/repay', retryOrderPayment);
router.post('/:id/cancel', cancelOrder);

// Đổi trả hàng (Khách hàng hoặc Sales)
router.post(
  '/:id/returns',
  requireFields('oldSerialNumberId', 'reason'),
  requestOrderReturn
);

// Cập nhật trạng thái đơn (Admin / Staff Sales / Warehouse)
router.put(
  '/:id/status',
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'sales', 'warehouse'),
  updateOrderStatus
);

// Cập nhật vận đơn hãng vận chuyển (Warehouse / Sales)
router.put(
  '/:id/shipment',
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'warehouse'),
  requireFields('tenHangGiao', 'trackingCode'),
  updateShipment
);

export default router;
