// server.js - Corrected Version
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  optionsSuccessStatus: 200
};

// Apply CORS with proper configuration
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes - Load all routes properly
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Load order routes with proper error handling
try {
  const orderRoutes = require('./routes/orderRoutes');
  app.use('/api/orders', orderRoutes);
  console.log('✅ Order routes loaded successfully');
} catch (error) {
  console.log('⚠️ Order routes not found, creating fallback routes...');
  console.error('Order routes error:', error.message);
  
  // Create fallback order routes for demo purposes
  const router = express.Router();
  
  // Fallback checkout route
  router.post('/checkout', (req, res) => {
    // Simulate order creation
    const mockOrder = {
      orderNumber: `TH${Date.now()}${Math.floor(Math.random() * 1000)}`,
      totalAmount: req.body.totalAmount || 0,
      createdAt: new Date().toISOString(),
      orderStatus: 'pending',
      buyer: req.user?.id || 'demo-user',
      shippingAddress: req.body.shippingAddress,
      billingAddress: req.body.billingAddress,
      paymentMethod: req.body.paymentMethod,
      paymentDetails: req.body.paymentDetails
    };
    
    console.log('📦 Demo order created:', mockOrder.orderNumber);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully (demo mode)',
      order: mockOrder,
      orderNumber: mockOrder.orderNumber
    });
  });
  
  // Fallback get orders route
  router.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      orders: [],
      message: 'Demo mode - no orders available'
    });
  });
  
  app.use('/api/orders', router);
  console.log('✅ Fallback order routes created');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    routes: {
      auth: '/api/auth',
      products: '/api/products', 
      upload: '/api/upload',
      cart: '/api/cart',
      orders: '/api/orders'
    }
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// MongoDB event listeners
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. ')
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.path);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    availableRoutes: [
      'GET /health',
      'POST /api/auth/login',
      'POST /api/auth/register', 
      'GET /api/products',
      'POST /api/products',
      'GET /api/cart',
      'POST /api/cart/add',
      'POST /api/orders/checkout'
    ],
    availableSuppliers: [
      'GET /api/orders/supplier/my-orders',
      'GET /api/orders/supplier/stats',
      'PUT /api/orders/supplier/:id/status'
    ]
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🌐 CORS enabled for:', corsOptions.origin);
  console.log('💾 MongoDB URI:', process.env.MONGODB_URI ? '✅ Configured' : '❌ Missing');
  console.log('☁️  AWS S3 Bucket:', process.env.AWS_S3_BUCKET ? '✅ Configured' : '❌ Missing');
  console.log('🛒 Available APIs:');
  console.log('   - Auth: /api/auth');
  console.log('   - Products: /api/products');
  console.log('   - Cart: /api/cart');
  console.log('   - Orders: /api/orders');
  console.log('   - Upload: /api/upload');
  console.log('   - Health: /health');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  server.close(() => {
    process.exit(0);
  });
});

process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});