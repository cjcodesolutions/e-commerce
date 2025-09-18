// backend/routes/orderRoutes.js
const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getSupplierOrders,
  cancelOrder
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Buyer routes
router.post('/', authorize('buyer'), createOrder);
router.get('/my-orders', authorize('buyer'), getMyOrders);
router.put('/:id/cancel', authorize('buyer'), cancelOrder);

// Supplier routes
router.get('/supplier-orders', authorize('supplier'), getSupplierOrders);
router.put('/:id/status', authorize('supplier'), updateOrderStatus);

// Both buyers and suppliers can access specific orders
router.get('/:id', getOrder);

module.exports = router;