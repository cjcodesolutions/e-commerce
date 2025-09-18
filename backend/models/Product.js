// backend/models/Product.js
const mongoose = require('mongoose');

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
    trim: true,
    enum: {
      values: [
        'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Automotive',
        'Beauty', 'Books', 'Toys', 'Health', 'Industrial', 'Food & Beverage',
        'Office Supplies', 'Jewelry', 'Musical Instruments', 'Pet Supplies',
        'Travel', 'Art & Crafts', 'Baby Products', 'Outdoor', 'Tools'
      ],
      message: 'Invalid category selected'
    }
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Subcategory cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: 'Price must be a positive number'
    }
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY']
  },
  minOrderQuantity: {
    type: Number,
    required: [true, 'Minimum order quantity is required'],
    min: [1, 'Minimum order quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Minimum order quantity must be a whole number'
    }
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: {
      values: ['piece', 'kg', 'gram', 'liter', 'meter', 'set', 'box', 'dozen', 'pair', 'pack'],
      message: 'Invalid unit selected'
    }
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
  specifications: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Specification name cannot exceed 100 characters']
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Specification value cannot exceed 200 characters']
    }
  }],
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
    default: 0,
    min: [0, 'Stock cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Stock must be a whole number'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'draft', 'out_of_stock'],
      message: 'Invalid status'
    },
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Supplier is required']
  },
  // SEO and search optimization
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  // Metrics
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  orders: {
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
      default: 0
    }
  },
  // Additional fields
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'gram', 'pound', 'ounce']
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch', 'meter']
    }
  },
  shippingInfo: {
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      min: 0,
      default: 0
    },
    processingTime: {
      type: String,
      enum: ['1-2 days', '3-5 days', '1 week', '2 weeks', '3-4 weeks', 'custom']
    }
  },
  // Compliance and certifications
  certifications: [{
    name: String,
    issuedBy: String,
    validUntil: Date,
    certificateUrl: String
  }],
  compliance: [{
    standard: String,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  // Admin fields
  isApproved: {
    type: Boolean,
    default: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better performance
productSchema.index({ supplier: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ createdAt: -1 });
productSchema.index({ views: -1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ price: 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `${this.currency} ${this.price.toFixed(2)}`;
});

// Virtual for availability status
productSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.stock > 0;
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + this._id.toString().slice(-6);
  }
  
  // Update lastModified
  this.lastModified = new Date();
  next();
});

// Pre-save middleware to extract keywords from name and description
productSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isModified('description') || this.isModified('tags')) {
    const keywords = new Set();
    
    // Extract from name
    this.name.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) keywords.add(word);
    });
    
    // Extract from description
    this.description.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 3) keywords.add(word);
    });
    
    // Add tags
    this.tags.forEach(tag => keywords.add(tag.toLowerCase()));
    
    // Add brand if exists
    if (this.brand) keywords.add(this.brand.toLowerCase());
    
    this.keywords = Array.from(keywords).slice(0, 20); // Limit to 20 keywords
  }
  next();
});

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
  return this.supplier.toString() === userId.toString();
};

// Static method to find products by supplier
productSchema.statics.findBySupplier = function(supplierId) {
  return this.find({ supplier: supplierId });
};

// Static method to find active products
productSchema.statics.findActive = function() {
  return this.find({ status: 'active', isApproved: true });
};

// Static method to search products
productSchema.statics.searchProducts = function(query, options = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    brand,
    status = 'active',
    limit = 20,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;

  const searchCriteria = {
    status,
    isApproved: true
  };

  // Text search
  if (query) {
    searchCriteria.$text = { $search: query };
  }

  // Category filter
  if (category) {
    searchCriteria.category = category;
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    searchCriteria.price = {};
    if (minPrice !== undefined) searchCriteria.price.$gte = minPrice;
    if (maxPrice !== undefined) searchCriteria.price.$lte = maxPrice;
  }

  // Brand filter
  if (brand) {
    searchCriteria.brand = new RegExp(brand, 'i');
  }

  return this.find(searchCriteria)
    .populate('supplier', 'firstName lastName company')
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip);
};

// Ensure virtual fields are serialized
productSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Product', productSchema);