import express from 'express';
import {
  getFeatures,
  getFeatureDetail,
  createFeature,
  updateFeature,
  deleteFeature,
} from '../controllers/feature.controller.js';
import { verifyToken, authorizeRoles, authorizePositions } from '../middlewares/auth.middleware.js';
import { requireFields } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getFeatures);
router.get('/:idOrSlug', getFeatureDetail);

// Protected routes (Admin / Warehouse Staff)
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'warehouse'),
  requireFields('name'),
  createFeature
);

router.put(
  '/:id',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'warehouse'),
  updateFeature
);

router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'warehouse'),
  deleteFeature
);

export default router;

