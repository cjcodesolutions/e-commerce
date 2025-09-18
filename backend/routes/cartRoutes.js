// backend/routes/cartRoutes.js
const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  mergeGuestCart,
  validateCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// Cart management routes
router.get('/', getCart);                          // GET /api/cart - Get user's cart
router.post('/add', addToCart);                    // POST /api/cart/add - Add item to cart
router.put('/update', updateCartItem);             // PUT /api/cart/update - Update item quantity
router.delete('/remove/:productId', removeFromCart); // DELETE /api/cart/remove/:productId - Remove item
router.delete('/clear', clearCart);                // DELETE /api/cart/clear - Clear entire cart

// Utility routes
router.get('/count', getCartCount);                // GET /api/cart/count - Get cart item count
router.post('/merge', mergeGuestCart);             // POST /api/cart/merge - Merge guest cart
router.post('/validate', validateCart);            // POST /api/cart/validate - Validate cart items

module.exports = router;