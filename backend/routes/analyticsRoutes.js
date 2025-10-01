// backend/routes/analyticsRoutes.js
const express = require('express');
const { getSellerAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// Seller analytics
router.get('/seller', authorize('supplier'), getSellerAnalytics);

module.exports = router;