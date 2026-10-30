import express from 'express';
import {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from '../controllers/product.controller.js';
import { verifyToken, authorizeRoles, authorizePositions } from '../middlewares/auth.middleware.js';
import { requireFields } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:idOrSlug', getProductDetail);

// Protected routes (Admin / Warehouse staff)
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'warehouse'),
  requireFields('name', 'slug', 'basePrice'),
  createProduct
);

router.put(
  '/:id',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'warehouse'),
  updateProduct
);

router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('admin'),
  authorizePositions('manager'),
  deleteProduct
);

router.post(
  '/:id/variants',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'warehouse'),
  requireFields('sku', 'price'),
  addProductVariant
);

router.put(
  '/:id/variants/:variantId',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  authorizePositions('manager', 'warehouse'),
  updateProductVariant
);

router.delete(
  '/:id/variants/:variantId',
  verifyToken,
  authorizeRoles('admin'),
  authorizePositions('manager'),
  deleteProductVariant
);

export default router;
