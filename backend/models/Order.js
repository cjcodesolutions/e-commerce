// backend/models/Order.js - Complete Order Model
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be a whole number'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Supplier is required']
  }
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [100, 'State cannot exceed 100 characters']
  },
  zipCode: {
    type: String,
    required: [true, 'Zip code is required'],
    trim: true,
    maxlength: [20, 'Zip code cannot exceed 20 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [100, 'Country cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Please enter a valid phone number'
    }
  }
});

const timelineEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: [true, 'Timeline status is required'],
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Timeline note cannot exceed 500 characters']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: [true, 'Order number is required'],
    trim: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required']
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: [true, 'Shipping address is required']
  },
  billingAddress: {
    type: shippingAddressSchema,
    required: [true, 'Billing address is required']
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
      message: 'Invalid payment method'
    },
    required: [true, 'Payment method is required']
  },
  paymentDetails: {
    cardLast4: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\d{4}$/.test(v);
        },
        message: 'Card last 4 digits must be exactly 4 numbers'
      }
    },
    cardBrand: {
      type: String,
      enum: ['Visa', 'Mastercard', 'Amex', 'Discover', 'Unknown']
    },
    transactionId: {
      type: String,
      trim: true
    },
    paymentGateway: {
      type: String,
      enum: ['stripe', 'paypal', 'square', 'manual'],
      default: 'stripe'
    }
  },
  orderStatus: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      message: 'Invalid order status'
    },
    default: 'pending',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      message: 'Invalid payment status'
    },
    default: 'pending',
    required: true
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: {
      values: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY'],
      message: 'Invalid currency'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  estimatedDeliveryDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v > Date.now();
      },
      message: 'Estimated delivery date must be in the future'
    }
  },
  actualDeliveryDate: {
    type: Date
  },
  trackingNumber: {
    type: String,
    trim: true,
    maxlength: [100, 'Tracking number cannot exceed 100 characters']
  },
  shippingCarrier: {
    type: String,
    enum: ['fedex', 'ups', 'dhl', 'usps', 'local', 'other'],
    trim: true
  },
  // Order timeline for tracking status changes
  timeline: {
    type: [timelineEventSchema],
    default: []
  },
  // Cancellation details
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Refund details
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative']
  },
  refundReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Refund reason cannot exceed 500 characters']
  },
  refundedAt: {
    type: Date
  },
  // Metadata
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  orderSource: {
    type: String,
    enum: ['web', 'mobile', 'api', 'admin'],
    default: 'web'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for better query performance
orderSchema.index({ buyer: 1, createdAt: -1 }); // User's order history
orderSchema.index({ orderNumber: 1 }); // Quick order lookup
orderSchema.index({ orderStatus: 1 }); // Filter by status
orderSchema.index({ paymentStatus: 1 }); // Filter by payment status
orderSchema.index({ 'items.supplier': 1, createdAt: -1 }); // Supplier's orders
orderSchema.index({ createdAt: -1 }); // Latest orders first
orderSchema.index({ 'items.supplier': 1, paymentStatus: 1 }); // Supplier paid orders
orderSchema.index({ 'items.supplier': 1, orderStatus: 1 }); // Supplier orders by status

// Compound index for supplier analytics
orderSchema.index({ 'items.supplier': 1, paymentStatus: 1, createdAt: -1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    // Generate unique order number
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.orderNumber = `TH${timestamp}${randomSuffix}`;
  }
  next();
});

// Pre-save middleware to add timeline entry on status change
orderSchema.pre('save', function(next) {
  if (this.isModified('orderStatus') && !this.isNew) {
    // Add timeline entry for status change
    this.timeline.push({
      status: this.orderStatus,
      timestamp: new Date(),
      note: `Order status changed to ${this.orderStatus}`
    });
  }
  
  // Set actual delivery date when status becomes delivered
  if (this.isModified('orderStatus') && this.orderStatus === 'delivered' && !this.actualDeliveryDate) {
    this.actualDeliveryDate = new Date();
  }
  
  // Set cancellation timestamp
  if (this.isModified('orderStatus') && this.orderStatus === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  
  next();
});

// Virtual for formatted total amount
orderSchema.virtual('formattedTotal').get(function() {
  return `${this.currency} ${this.totalAmount.toFixed(2)}`;
});

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for order completion status
orderSchema.virtual('isCompleted').get(function() {
  return ['delivered', 'cancelled', 'refunded'].includes(this.orderStatus);
});

// Virtual for payment completion status  
orderSchema.virtual('isPaid').get(function() {
  return this.paymentStatus === 'paid';
});

// Instance method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  this.totalAmount = this.subtotal + this.shippingCost + this.tax - this.discount;
  return this;
};

// Instance method to update status with timeline
orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = null) {
  const oldStatus = this.orderStatus;
  this.orderStatus = newStatus;
  
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Status changed from ${oldStatus} to ${newStatus}`,
    updatedBy: updatedBy
  });
  
  return this.save();
};

// Instance method to add tracking information
orderSchema.methods.addTracking = function(trackingNumber, carrier = null) {
  this.trackingNumber = trackingNumber;
  if (carrier) {
    this.shippingCarrier = carrier;
  }
  
  this.timeline.push({
    status: this.orderStatus,
    timestamp: new Date(),
    note: `Tracking number added: ${trackingNumber}${carrier ? ` via ${carrier}` : ''}`
  });
  
  return this.save();
};

// Instance method to cancel order
orderSchema.methods.cancelOrder = function(reason, cancelledBy = null) {
  this.orderStatus = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  
  this.timeline.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: `Order cancelled: ${reason}`,
    updatedBy: cancelledBy
  });
  
  return this.save();
};

// Static method to find orders by buyer
orderSchema.statics.findByBuyer = function(buyerId, options = {}) {
  const {
    status,
    paymentStatus,
    page = 1,
    limit = 10,
    sort = '-createdAt'
  } = options;

  let query = { buyer: buyerId };
  
  if (status && status !== 'all') {
    query.orderStatus = status;
  }
  
  if (paymentStatus && paymentStatus !== 'all') {
    query.paymentStatus = paymentStatus;
  }

  return this.find(query)
    .populate('items.product', 'name images category price')
    .populate('items.supplier', 'firstName lastName profile.company')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to find orders by supplier
orderSchema.statics.findBySupplier = function(supplierId, options = {}) {
  const {
    status,
    paymentStatus,
    page = 1,
    limit = 10,
    sort = '-createdAt'
  } = options;

  let query = { 'items.supplier': supplierId };
  
  if (status && status !== 'all') {
    query.orderStatus = status;
  }
  
  if (paymentStatus && paymentStatus !== 'all') {
    query.paymentStatus = paymentStatus;
  }

  return this.find(query)
    .populate('buyer', 'firstName lastName email profile.company profile.phone')
    .populate('items.product', 'name images category price brand')
    .populate('items.supplier', 'firstName lastName profile.company')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method for supplier analytics
orderSchema.statics.getSupplierAnalytics = function(supplierId, dateRange = {}) {
  const { startDate, endDate } = dateRange;
  
  let matchStage = { 
    'items.supplier': supplierId,
    paymentStatus: 'paid'
  };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }
  
  return this.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    { $match: { 'items.supplier': supplierId } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        totalOrders: { $addToSet: '$_id' },
        totalItems: { $sum: '$items.quantity' },
        avgOrderValue: { $avg: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        totalOrders: { $size: '$totalOrders' },
        totalItems: 1,
        avgOrderValue: 1
      }
    }
  ]);
};

// Static method to get revenue by month
orderSchema.statics.getMonthlyRevenue = function(supplierId, months = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  return this.aggregate([
    {
      $match: {
        'items.supplier': supplierId,
        paymentStatus: 'paid',
        createdAt: { $gte: startDate }
      }
    },
    { $unwind: '$items' },
    { $match: { 'items.supplier': supplierId } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $addToSet: '$_id' },
        items: { $sum: '$items.quantity' }
      }
    },
    {
      $project: {
        _id: 1,
        revenue: 1,
        orderCount: { $size: '$orders' },
        items: 1
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
};

// Ensure virtual fields are serialized
orderSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Remove sensitive payment details from public responses
    if (ret.paymentDetails && ret.paymentDetails.transactionId) {
      ret.paymentDetails.transactionId = '***HIDDEN***';
    }
    
    // Remove internal fields
    delete ret.__v;
    delete ret.ipAddress;
    delete ret.userAgent;
    
    return ret;
  }
});

module.exports = mongoose.model('Order', orderSchema);