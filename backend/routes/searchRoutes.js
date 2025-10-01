// backend/routes/searchRoutes.js
const express = require('express');
const {
  searchProducts,
  getSearchSuggestions,
  searchSuppliers
} = require('../controllers/searchController');

const router = express.Router();

// All search routes are public
router.get('/products', searchProducts);
router.get('/suggestions', getSearchSuggestions);
router.get('/suppliers', searchSuppliers);

module.exports = router;