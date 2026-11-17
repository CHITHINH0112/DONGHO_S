import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cart.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requireFields } from '../middlewares/validate.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getCart);
router.post('/items', requireFields('variantId'), addToCart);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.delete('/', clearCart);

export default router;
