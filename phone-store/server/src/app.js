const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { apiLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Security & logging
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limit toàn bộ API
app.use('/api', apiLimiter);

// Load models
require('./models/index');

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/brands', require('./routes/brand.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server đang chạy', env: process.env.NODE_ENV, timestamp: new Date() });
});

app.get('/api/health/email', async (req, res) => {
  const { verifyEmailConfig } = require('./utils/otp.utils');
  const result = await verifyEmailConfig();
  res.json({ success: true, email: result });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} không tồn tại` });
});

// Error handler — phải đặt cuối cùng
app.use(errorHandler);

module.exports = app;
