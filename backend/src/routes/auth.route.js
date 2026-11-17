import express from 'express';
import { register, login, googleLogin, refreshToken, getMe, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

export default router;
