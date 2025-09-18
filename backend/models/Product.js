// backend/models/Product.js
const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Automotive', 
      'Beauty', 'Books', 'Toys', 'Health', 'Industrial'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  minOrderQuantity: {
    type: Number,
    required: [true, 'Minimum order quantity is required'],
    min: [1, 'Minimum order quantity must be at least 1'],
    default: 1
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['piece', 'kg', 'gram', 'liter', 'meter', 'set', 'box', 'dozen']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters']
  },
  specifications: [specificationSchema],
  features: [{
    type: String,
    trim: true,
    maxlength: [200, 'Feature cannot exceed 200 characters']
  }],
  images: [{
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid image URL'
    }
  }],
  stock: {
    type: Number,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'out_of_stock'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Seller information
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Analytics and metrics
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  // Shipping information
  shipping: {
    weight: {
      type: Number,
      min: 0
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingTime: {
      min: Number,
      max: Number
    }
  },
  // Inventory management
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  restockDate: {
    type: Date
  },
  // Pricing
  originalPrice: {
    type: Number
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Validation flags
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationNotes: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ views: -1 });
productSchema.index({ 'rating.average': -1 });

// Update stock status automatically
productSchema.pre('save', function(next) {
  if (this.stock <= 0 && this.status === 'active') {
    this.status = 'out_of_stock';
  } else if (this.stock > 0 && this.status === 'out_of_stock') {
    this.status = 'active';
  }
  next();
});

// Virtual for discounted price
productSchema.virtual('finalPrice').get(function() {
  if (this.discountPercentage > 0) {
    return this.price * (1 - this.discountPercentage / 100);
  }
  return this.price;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock <= 0) {
    return 'out_of_stock';
  } else if (this.stock <= this.lowStockThreshold) {
    return 'low_stock';
  } else {
    return 'in_stock';
  }
});

// Virtual for main image
productSchema.virtual('mainImage').get(function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
});

// Static method to find products by seller
productSchema.statics.findBySeller = function(sellerId, options = {}) {
  const query = { seller: sellerId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  return this.find(query);
};

// Static method to search products
productSchema.statics.searchProducts = function(searchTerm, options = {}) {
  const query = {
    $text: { $search: searchTerm },
    status: 'active'
  };
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.priceMin || options.priceMax) {
    query.price = {};
    if (options.priceMin) query.price.$gte = options.priceMin;
    if (options.priceMax) query.price.$lte = options.priceMax;
  }
  
  return this.find(query, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } });
};

// Instance method to increment views
productSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to increment inquiries
productSchema.methods.incrementInquiries = function() {
  this.inquiries += 1;
  return this.save();
};

// Instance method to check if user can edit
productSchema.methods.canEdit = function(userId) {
  return this.seller.toString() === userId.toString();
};

// Instance method to update rating
productSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);