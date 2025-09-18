// backend/models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be a whole number'
    }
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One cart per user
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // For guest sessions (temporary carts)
  sessionId: {
    type: String,
    sparse: true // Allow multiple null values but unique non-null values
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    expires: 0 // TTL index - automatically delete expired documents
  }
}, {
  timestamps: true
});

// Indexes
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ expiresAt: 1 });

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.lastUpdated = new Date();
  next();
});

// Instance method to add item to cart
cartSchema.methods.addItem = function(productId, quantity, price) {
  const existingItemIndex = this.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].price = price; // Update price in case it changed
    this.items[existingItemIndex].addedAt = new Date();
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      price,
      addedAt: new Date()
    });
  }

  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
  const itemIndex = this.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = quantity;
      this.items[itemIndex].addedAt = new Date();
    }
    return this.save();
  }
  
  throw new Error('Item not found in cart');
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(
    item => item.product.toString() !== productId.toString()
  );
  return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// Instance method to get cart summary
cartSchema.methods.getSummary = function() {
  return {
    totalItems: this.totalItems,
    totalAmount: this.totalAmount,
    currency: this.currency,
    itemCount: this.items.length,
    lastUpdated: this.lastUpdated
  };
};

// Static method to find or create cart for user
cartSchema.statics.findOrCreateForUser = async function(userId) {
  let cart = await this.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name price images status supplier category'
  });

  if (!cart) {
    cart = await this.create({ user: userId });
    // Populate after creation
    cart = await this.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images status supplier category'
    });
  }

  return cart;
};

// Static method to merge guest cart with user cart
cartSchema.statics.mergeGuestCart = async function(userId, guestCartItems) {
  const userCart = await this.findOrCreateForUser(userId);
  
  for (const guestItem of guestCartItems) {
    await userCart.addItem(guestItem.product._id, guestItem.quantity, guestItem.price);
  }
  
  return userCart;
};

// Virtual for formatted total amount
cartSchema.virtual('formattedTotal').get(function() {
  return `${this.currency} ${this.totalAmount.toFixed(2)}`;
});

// Ensure virtual fields are serialized
cartSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Cart', cartSchema);