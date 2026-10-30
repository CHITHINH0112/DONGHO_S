import express from 'express';
import { handleUploadImage, handleUploadMultipleImages } from '../controllers/upload.controller.js';
import { uploadSingleImage } from '../middlewares/upload.middleware.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  (req, res, next) => {
    uploadSingleImage.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Lỗi khi tải lên tệp ảnh. Dung lượng tối đa là 5MB.',
        });
      }
      next();
    });
  },
  handleUploadImage
);

router.post(
  '/multiple',
  verifyToken,
  authorizeRoles('admin', 'staff'),
  (req, res, next) => {
    uploadSingleImage.array('images', 10)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Lỗi khi tải lên danh sách tệp ảnh.',
        });
      }
      next();
    });
  },
  handleUploadMultipleImages
);

export default router;

