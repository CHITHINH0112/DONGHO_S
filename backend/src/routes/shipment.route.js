import express from 'express';
import {
  getProvinces,
  getDistricts,
  getWards,
  calculateShippingFee,
  getTrackingTimeline,
  getShipments,
  updateShipmentStatus,
  syncShipmentGHN,
} from '../controllers/shipment.controller.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Master data địa chính GHN & tính phí
router.get('/ghn/provinces', getProvinces);
router.get('/ghn/districts', getDistricts);
router.get('/ghn/wards', getWards);
router.post('/fee', calculateShippingFee);
router.get('/tracking/:code', getTrackingTimeline);

// Admin quản lý vận đơn GHN Express
router.get('/', verifyToken, authorizeRoles('admin', 'staff'), getShipments);
router.put('/:id/status', verifyToken, authorizeRoles('admin', 'staff'), updateShipmentStatus);
router.post('/:id/sync', verifyToken, authorizeRoles('admin', 'staff'), syncShipmentGHN);

export default router;
