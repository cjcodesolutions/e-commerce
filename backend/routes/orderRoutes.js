// backend/routes/orderRoutes.js - Fixed Version with all functions
const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
  getSupplierOrders,
  getSupplierOrderStats,
  updateSupplierOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(protect);

// Buyer routes
router.post('/checkout', authorize('buyer'), createOrder);      // POST /api/orders/checkout - Create order
router.put('/:id/cancel', authorize('buyer'), cancelOrder);    // PUT /api/orders/:id/cancel - Cancel order

// Supplier-specific routes (must come before general routes to avoid conflicts)
router.get('/supplier/my-orders', authorize('supplier'), getSupplierOrders);        // GET /api/orders/supplier/my-orders
router.get('/supplier/stats', authorize('supplier'), getSupplierOrderStats);        // GET /api/orders/supplier/stats  
router.put('/supplier/:id/status', authorize('supplier'), updateSupplierOrderStatus); // PUT /api/orders/supplier/:id/status

// General routes (for both buyers and suppliers)
router.get('/stats', getOrderStats);                           // GET /api/orders/stats - Get order statistics
router.get('/', getUserOrders);                                // GET /api/orders - Get user's orders
router.get('/:id', getOrder);                                  // GET /api/orders/:id - Get single order

// Legacy supplier route (kept for backward compatibility)
router.put('/:id/status', authorize('supplier'), updateOrderStatus); // PUT /api/orders/:id/status - Update order status

module.exports = router;