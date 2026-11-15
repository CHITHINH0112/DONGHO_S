import express from 'express';
import { getAllUser, updateUserStatus } from '../controllers/userController.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Yêu cầu đăng nhập tài khoản có role là admin hoặc staff
router.use(verifyToken);
router.use(authorizeRoles('admin', 'staff'));

// GET /api/v1/users hoặc GET /api/v1/users/user
router.get('/', getAllUser);
router.get('/user', getAllUser);

// PUT /api/v1/users/:id/status
router.put('/:id/status', updateUserStatus);

export default router;
