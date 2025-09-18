// backend/controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    console.log('=== GET CART REQUEST ===');
    console.log('User ID:', req.user._id);

    const cart = await Cart.findOrCreateForUser(req.user._id);

    console.log(`Cart found with ${cart.items.length} items`);

    res.status(200).json({
      success: true,
      cart,
      summary: cart.getSummary()
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart'
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    console.log('=== ADD TO CART REQUEST ===');
    console.log('User ID:', req.user._id);
    console.log('Request body:', req.body);

    const { productId, quantity = 1, price } = req.body;

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Check minimum order quantity
    if (quantity < product.minOrderQuantity) {
      return res.status(400).json({
        success: false,
        message: `Minimum order quantity is ${product.minOrderQuantity}`
      });
    }

    // Use provided price or product price
    const itemPrice = price || product.price;

    console.log(`Adding ${quantity} units of product ${productId} at ${itemPrice} each`);

    // Get or create user's cart
    const cart = await Cart.findOrCreateForUser(req.user._id);

    // Add item to cart
    await cart.addItem(productId, quantity, itemPrice);

    // Reload cart with populated products
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images status supplier category minOrderQuantity',
      populate: {
        path: 'supplier',
        select: 'firstName lastName profile.company'
      }
    });

    console.log(`Item added successfully. Cart now has ${updatedCart.totalItems} items`);

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart: updatedCart,
      summary: updatedCart.getSummary()
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding item to cart'
    });
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/update
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    console.log('=== UPDATE CART ITEM REQUEST ===');
    console.log('User ID:', req.user._id);
    console.log('Request body:', req.body);

    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // If quantity is provided, check minimum order quantity
    if (quantity > 0) {
      const product = await Product.findById(productId);
      if (product && quantity < product.minOrderQuantity) {
        return res.status(400).json({
          success: false,
          message: `Minimum order quantity is ${product.minOrderQuantity}`
        });
      }
    }

    // Update item quantity
    await cart.updateItemQuantity(productId, quantity);

    // Reload cart with populated products
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images status supplier category minOrderQuantity',
      populate: {
        path: 'supplier',
        select: 'firstName lastName profile.company'
      }
    });

    console.log(`Cart item updated. Cart now has ${updatedCart.totalItems} items`);

    res.status(200).json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart item updated successfully',
      cart: updatedCart,
      summary: updatedCart.getSummary()
    });

  } catch (error) {
    console.error('Update cart item error:', error);
    
    if (error.message === 'Item not found in cart') {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating cart item'
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    console.log('=== REMOVE FROM CART REQUEST ===');
    console.log('User ID:', req.user._id);
    console.log('Product ID:', req.params.productId);

    const { productId } = req.params;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item from cart
    await cart.removeItem(productId);

    // Reload cart with populated products
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images status supplier category minOrderQuantity',
      populate: {
        path: 'supplier',
        select: 'firstName lastName profile.company'
      }
    });

    console.log(`Item removed. Cart now has ${updatedCart.totalItems} items`);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: updatedCart,
      summary: updatedCart.getSummary()
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing item from cart'
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    console.log('=== CLEAR CART REQUEST ===');
    console.log('User ID:', req.user._id);

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Clear cart
    await cart.clearCart();

    console.log('Cart cleared successfully');

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart,
      summary: cart.getSummary()
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart'
    });
  }
};

// @desc    Get cart item count
// @route   GET /api/cart/count
// @access  Private
exports.getCartCount = async (req, res) => {
  try {
    console.log('=== GET CART COUNT REQUEST ===');
    console.log('User ID:', req.user._id);

    const cart = await Cart.findOne({ user: req.user._id });
    const count = cart ? cart.totalItems : 0;

    console.log(`Cart has ${count} items`);

    res.status(200).json({
      success: true,
      count,
      itemCount: cart ? cart.items.length : 0
    });

  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart count'
    });
  }
};

// @desc    Merge guest cart with user cart (after login)
// @route   POST /api/cart/merge
// @access  Private
exports.mergeGuestCart = async (req, res) => {
  try {
    console.log('=== MERGE GUEST CART REQUEST ===');
    console.log('User ID:', req.user._id);
    console.log('Guest cart items:', req.body.guestCartItems);

    const { guestCartItems = [] } = req.body;

    if (guestCartItems.length === 0) {
      const cart = await Cart.findOrCreateForUser(req.user._id);
      return res.status(200).json({
        success: true,
        message: 'No guest items to merge',
        cart,
        summary: cart.getSummary()
      });
    }

    // Merge guest cart with user cart
    const mergedCart = await Cart.mergeGuestCart(req.user._id, guestCartItems);

    console.log(`Guest cart merged. Cart now has ${mergedCart.totalItems} items`);

    res.status(200).json({
      success: true,
      message: `${guestCartItems.length} item(s) merged from guest cart`,
      cart: mergedCart,
      summary: mergedCart.getSummary()
    });

  } catch (error) {
    console.error('Merge guest cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while merging guest cart'
    });
  }
};

// @desc    Validate cart items (check availability, prices, etc.)
// @route   POST /api/cart/validate
// @access  Private
exports.validateCart = async (req, res) => {
  try {
    console.log('=== VALIDATE CART REQUEST ===');
    console.log('User ID:', req.user._id);

    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images status supplier category minOrderQuantity stock'
    });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Cart is empty',
        cart: cart || { items: [], totalItems: 0, totalAmount: 0 },
        issues: []
      });
    }

    const issues = [];
    const validItems = [];

    for (const item of cart.items) {
      const product = item.product;
      
      if (!product) {
        issues.push({
          type: 'product_not_found',
          message: 'Product no longer exists',
          itemId: item._id
        });
        continue;
      }

      if (product.status !== 'active') {
        issues.push({
          type: 'product_inactive',
          message: `${product.name} is no longer available`,
          itemId: item._id,
          productId: product._id
        });
        continue;
      }

      if (item.quantity < product.minOrderQuantity) {
        issues.push({
          type: 'min_quantity_not_met',
          message: `${product.name} requires minimum quantity of ${product.minOrderQuantity}`,
          itemId: item._id,
          productId: product._id,
          currentQuantity: item.quantity,
          minQuantity: product.minOrderQuantity
        });
      }

      if (product.price !== item.price) {
        issues.push({
          type: 'price_changed',
          message: `Price for ${product.name} has changed`,
          itemId: item._id,
          productId: product._id,
          oldPrice: item.price,
          newPrice: product.price
        });
      }

      if (product.stock && product.stock < item.quantity) {
        issues.push({
          type: 'insufficient_stock',
          message: `Only ${product.stock} units of ${product.name} available`,
          itemId: item._id,
          productId: product._id,
          requestedQuantity: item.quantity,
          availableStock: product.stock
        });
      }

      validItems.push(item);
    }

    console.log(`Cart validation completed. Found ${issues.length} issues`);

    res.status(200).json({
      success: true,
      message: issues.length === 0 ? 'Cart is valid' : `Found ${issues.length} issue(s)`,
      cart,
      issues,
      validItemsCount: validItems.length,
      summary: cart.getSummary()
    });

  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while validating cart'
    });
  }
};