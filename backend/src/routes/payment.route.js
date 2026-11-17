import express from 'express';
import {
  createVNPayUrl,
  vnpayReturn,
  vnpayIpn,
} from '../controllers/payment.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/vnpay/create-url', verifyToken, createVNPayUrl);
router.get('/vnpay/callback', vnpayReturn);
router.get('/vnpay/ipn', vnpayIpn);

export default router;

