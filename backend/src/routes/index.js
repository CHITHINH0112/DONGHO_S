import express from 'express';
import { sequelize } from '../config/database.js';

// Sub-routers
import authRouter from './auth.route.js';
import productRouter from './product.route.js';
import watchRouter from './watch.route.js';
import categoryRouter from './category.route.js';
import brandRouter from './brand.route.js';
import bannerRouter from './banner.route.js';
import cartRouter from './cart.route.js';
import orderRouter from './order.route.js';
import userAddressRouter from './userAddress.route.js';
import warrantyRouter from './warranty.route.js';
import watchServiceRouter from './watchService.route.js';
import adminRouter from './admin.route.js';
import uploadRouter from './upload.route.js';
import featureRouter from './feature.route.js';

const router = express.Router();

/**
 * Health check endpoint: /api/v1/health
 */
router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = `error: ${error.message}`;
  }

  res.status(200).json({
    success: true,
    message: 'Luxury Watch API Server is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    database: {
      status: dbStatus,
      dialect: 'mysql',
      name: process.env.DB_NAME || 'dongho_shop',
    },
    modules: [
      'auth',
      'products',
      'watches',
      'categories',
      'brands',
      'banners',
      'cart',
      'orders',
      'user-addresses',
      'warranties',
      'services',
      'admin',
    ],
  });
});

// Gắn toàn bộ các sub-routers vào API v1
router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/watches', watchRouter);
router.use('/categories', categoryRouter);
router.use('/brands', brandRouter);
router.use('/banners', bannerRouter);
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/user-addresses', userAddressRouter);
router.use('/warranties', warrantyRouter);
router.use('/services', watchServiceRouter);
router.use('/admin', adminRouter);
router.use('/upload', uploadRouter);
router.use('/features', featureRouter);

export default router;
