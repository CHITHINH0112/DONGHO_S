import app from './src/app.js';
import { connectDB } from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Kết nối và đồng bộ Database
  await connectDB();

  // Khởi động lắng nghe cổng
  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Luxury Watch Server is running on port ${PORT}`);
    console.log(`👉 Health check: http://localhost:${PORT}/api/v1/health`);
    console.log(`👉 Watches API:  http://localhost:${PORT}/api/v1/watches`);
    console.log(`===============================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Cổng ${PORT} đang bị chiếm dụng. Vui lòng thử lại sau giây lát.`);
    } else {
      console.error('❌ Lỗi khởi động server:', err);
    }
  });
};

startServer();
