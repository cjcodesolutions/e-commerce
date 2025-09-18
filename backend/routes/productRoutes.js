// backend/routes/productRoutes.js
const express = require('express');
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getSellerAnalytics,
  bulkUpdateStatus
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProducts);

// Protected routes (require authentication)
router.use(protect); // All routes below require authentication

// IMPORTANT: Specific routes must come BEFORE parameterized routes
// Supplier-only routes (must be before /:id route)
router.get('/seller/my-products', authorize('supplier'), getSellerProducts);
router.get('/analytics/seller', authorize('supplier'), getSellerAnalytics);
router.patch('/bulk-status', authorize('supplier'), bulkUpdateStatus);
router.post('/', authorize('supplier'), createProduct);

// Parameterized routes (must come AFTER specific routes)
router.get('/:id', getProduct);
router.put('/:id', authorize('supplier'), updateProduct);
router.delete('/:id', authorize('supplier'), deleteProduct);

module.exports = router;