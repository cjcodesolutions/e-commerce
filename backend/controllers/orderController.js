// backend/controllers/orderController.js - Fully Corrected Version
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create new order from cart
// @route   POST /api/orders/checkout
// @access  Private (Buyers only)
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    console.log('=== CREATE ORDER REQUEST ===');
    console.log('User ID:', req.user._id);
    console.log('Request body:', req.body);

    const {
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentDetails = {},
      notes = '',
      sameAsShipping = true
    } = req.body;

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
      throw new Error('Complete shipping address is required');
    }

    if (!paymentMethod) {
      throw new Error('Payment method is required');
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price images status supplier category minOrderQuantity stock',
        populate: {
          path: 'supplier',
          select: 'firstName lastName email profile.company'
        }
      })
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new Error('Your cart is empty');
    }

    console.log(`Creating order from cart with ${cart.items.length} items`);

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;
      
      if (!product) {
        throw new Error('One or more products in your cart no longer exist');
      }

      if (product.status !== 'active') {
        throw new Error(`Product "${product.name}" is no longer available`);
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: item.price,
        supplier: product.supplier._id
      });

      subtotal += item.price * item.quantity;
    }

    const shippingCost = 0;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + shippingCost + tax;
    const finalBillingAddress = sameAsShipping ? shippingAddress : billingAddress;
    const orderNumber = `ORD-${Date.now()}-${req.user._id.toString().slice(-6)}`;

    const orderData = {
      orderNumber,
      buyer: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress: finalBillingAddress,
      paymentMethod,
      paymentDetails: {
        cardLast4: paymentDetails.cardLast4 || undefined,
        cardBrand: paymentDetails.cardBrand || undefined,
        transactionId: paymentDetails.transactionId || undefined
      },
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      notes,
      timeline: [{
        status: 'confirmed',
        timestamp: new Date(),
        note: 'Order created successfully'
      }]
    };

    const newOrderArray = await Order.create([orderData], { session });
    const newOrder = newOrderArray[0];

    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [], totalItems: 0, totalAmount: 0 } },
      { session }
    );

    // If everything is successful, commit the transaction.
    await session.commitTransaction();

    // Populate the order outside the transaction for the response.
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('items.product', 'name images category')
      .populate('items.supplier', 'firstName lastName profile.company')
      .populate('buyer', 'firstName lastName email');

    console.log('Order created successfully:', populatedOrder.orderNumber);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: populatedOrder
    });

  } catch (error) {
    // If any error occurs, abort the transaction.
    await session.abortTransaction();
    console.error('Create order error:', error);
    
    res.status(400).json({
      success: false,
      message: error.message || 'Server error while creating order'
    });
  } finally {
    // Always end the session to clean up resources.
    session.endSession();
  }
};

// @desc    Get all orders for current user
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    console.log('=== GET USER ORDERS ===');
    console.log('User ID:', req.user._id);
    console.log('User Type:', req.user.userType);

    const status = req.query.status || undefined;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const sort = req.query.sort === 'createdAt' ? 'createdAt' : '-createdAt';

    let orders;
    let total;

    if (req.user.userType === 'buyer') {
      const query = { buyer: req.user._id };
      if (status && status !== 'all') {
        query.orderStatus = status;
      }

      [orders, total] = await Promise.all([
        Order.find(query)
          .populate('items.product', 'name images category')
          .populate('items.supplier', 'firstName lastName profile.company')
          .sort(sort)
          .limit(limit)
          .skip((page - 1) * limit)
          .lean(),
        Order.countDocuments(query)
      ]);
    } else if (req.user.userType === 'supplier') {
      const query = { 'items.supplier': req.user._id };
      if (status && status !== 'all') {
        query.orderStatus = status;
      }

      [orders, total] = await Promise.all([
        Order.find(query)
          .populate('buyer', 'firstName lastName email')
          .populate('items.product', 'name images category')
          .sort(sort)
          .limit(limit)
          .skip((page - 1) * limit)
          .lean(),
        Order.countDocuments(query)
      ]);
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    console.log(`Found ${orders.length} orders out of ${total} total`);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    console.log('=== GET SINGLE ORDER ===');
    console.log('Order ID:', req.params.id);
    console.log('User ID:', req.user._id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('buyer', 'firstName lastName email')
      .populate('items.product', 'name images category price')
      .populate('items.supplier', 'firstName lastName email profile.company')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const hasAccess = order.buyer._id.toString() === req.user._id.toString() ||
                      order.items.some(item => item.supplier._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this order'
      });
    }

    console.log('Order found:', order.orderNumber);

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

// @desc    Update order status (suppliers only)
// @route   PUT /api/orders/:id/status
// @access  Private (Suppliers only)
exports.updateOrderStatus = async (req, res) => {
  try {
    console.log('=== UPDATE ORDER STATUS ===');
    console.log('Order ID:', req.params.id);
    console.log('User ID:', req.user._id);
    console.log('Request body:', req.body);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const { status, note = '' } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const isSupplier = order.items.some(item => 
      item.supplier.toString() === req.user._id.toString()
    );

    if (!isSupplier) {
      return res.status(403).json({
        success: false,
        message: 'Only suppliers can update order status'
      });
    }

    await order.updateStatus(status, note);

    const updatedOrder = await Order.findById(order._id)
      .populate('buyer', 'firstName lastName email')
      .populate('items.product', 'name images category')
      .populate('items.supplier', 'firstName lastName profile.company')
      .lean();

    console.log(`Order status updated to: ${status}`);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};

// @desc    Cancel order (buyers only)
// @route   PUT /api/orders/:id/cancel
// @access  Private (Buyers only)
exports.cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    console.log('=== CANCEL ORDER ===');
    console.log('Order ID:', req.params.id);
    console.log('User ID:', req.user._id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new Error('Invalid order ID format');
    }

    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own orders'
      });
    }

    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      throw new Error('Order cannot be cancelled at this stage');
    }

    await order.cancelOrder('Cancelled by buyer', req.user._id);

    await session.commitTransaction();

    const updatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name images category')
      .populate('items.supplier', 'firstName lastName profile.company')
      .lean();

    console.log('Order cancelled successfully');

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Cancel order error:', error);
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Server error while cancelling order'
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
exports.getOrderStats = async (req, res) => {
  try {
    console.log('=== GET ORDER STATS ===');
    console.log('User ID:', req.user._id);
    console.log('User Type:', req.user.userType);

    let stats = {};

    if (req.user.userType === 'buyer') {
      const [totalOrders, pendingOrders, deliveredOrders, cancelledOrders, totalSpentResult] = await Promise.all([
        Order.countDocuments({ buyer: req.user._id }),
        Order.countDocuments({ buyer: req.user._id, orderStatus: 'pending' }),
        Order.countDocuments({ buyer: req.user._id, orderStatus: 'delivered' }),
        Order.countDocuments({ buyer: req.user._id, orderStatus: 'cancelled' }),
        Order.aggregate([
          { $match: { buyer: req.user._id, orderStatus: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ]);

      stats = {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalSpent: totalSpentResult[0]?.total || 0
      };
    } else if (req.user.userType === 'supplier') {
      const [totalOrders, pendingOrders, processingOrders, shippedOrders, totalRevenueResult] = await Promise.all([
        Order.countDocuments({ 'items.supplier': req.user._id }),
        Order.countDocuments({ 'items.supplier': req.user._id, orderStatus: 'pending' }),
        Order.countDocuments({ 'items.supplier': req.user._id, orderStatus: 'processing' }),
        Order.countDocuments({ 'items.supplier': req.user._id, orderStatus: 'shipped' }),
        Order.aggregate([
          { $match: { 'items.supplier': req.user._id, orderStatus: { $ne: 'cancelled' } } },
          { $unwind: '$items' },
          { $match: { 'items.supplier': req.user._id } },
          { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
        ])
      ]);

      stats = {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        totalRevenue: totalRevenueResult[0]?.total || 0
      };
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    console.log('Order stats calculated:', stats);

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order statistics'
    });
  }
};

// @desc    Get orders for supplier (for seller dashboard)
// @route   GET /api/orders/supplier/my-orders
// @access  Private (Suppliers only)
exports.getSupplierOrders = async (req, res) => {
  try {
    console.log('=== GET SUPPLIER ORDERS ===');
    console.log('Supplier ID:', req.user._id);
    console.log('Query params:', req.query);

    const status = req.query.status ? req.query.status.trim() : undefined;
    const paymentStatus = req.query.paymentStatus ? req.query.paymentStatus.trim() : undefined;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const sort = req.query.sort === 'createdAt' ? 'createdAt' : '-createdAt';
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : undefined;

    const query = { 'items.supplier': req.user._id };

    if (status && status !== 'all') {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (validStatuses.includes(status)) {
        query.orderStatus = status;
      }
    }

    if (paymentStatus && paymentStatus !== 'all') {
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (validPaymentStatuses.includes(paymentStatus)) {
        query.paymentStatus = paymentStatus;
      }
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = dateFrom;
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endOfDay;
      }
    }

    console.log('Final query:', query);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('buyer', 'firstName lastName email profile.company profile.phone')
        .populate({
          path: 'items.product',
          select: 'name images category price brand'
        })
        .sort(sort)
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    const processedOrders = orders.map(order => {
      const supplierItems = order.items.filter(
        item => item.supplier && item.supplier.toString() === req.user._id.toString()
      );
      
      const supplierTotal = supplierItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );

      return {
        ...order,
        items: supplierItems,
        supplierTotal: supplierTotal.toFixed(2),
        supplierItemCount: supplierItems.length
      };
    });

    console.log(`Found ${processedOrders.length} orders out of ${total} total`);

    res.status(200).json({
      success: true,
      count: processedOrders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders: processedOrders
    });

  } catch (error) {
    console.error('Get supplier orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching supplier orders'
    });
  }
};


// @desc    Get supplier order statistics
// @route   GET /api/orders/supplier/stats
// @access  Private (Suppliers only)
exports.getSupplierOrderStats = async (req, res) => {
  try {
    console.log('=== GET SUPPLIER ORDER STATS ===');
    console.log('Supplier ID:', req.user._id);

    const supplierId = req.user._id;

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      paidOrders,
      revenueStats,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments({ 'items.supplier': supplierId }),
      Order.countDocuments({ 'items.supplier': supplierId, orderStatus: 'pending' }),
      Order.countDocuments({ 'items.supplier': supplierId, orderStatus: 'processing' }),
      Order.countDocuments({ 'items.supplier': supplierId, orderStatus: 'shipped' }),
      Order.countDocuments({ 'items.supplier': supplierId, orderStatus: 'delivered' }),
      Order.countDocuments({ 'items.supplier': supplierId, orderStatus: 'cancelled' }),
      Order.countDocuments({ 'items.supplier': supplierId, paymentStatus: 'paid' }),
      
      Order.aggregate([
        { $match: { 'items.supplier': supplierId, paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $match: { 'items.supplier': supplierId } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            avgOrderValue: { $avg: { $multiply: ['$items.price', '$items.quantity'] } },
            totalItemsSold: { $sum: '$items.quantity' }
          }
        }
      ]),
      
      Order.find({ 'items.supplier': supplierId })
        .populate('buyer', 'firstName lastName')
        .populate('items.product', 'name')
        .sort('-createdAt')
        .limit(5)
        .lean()
    ]);

    const revenue = revenueStats[0] || { 
      totalRevenue: 0, 
      avgOrderValue: 0, 
      totalItemsSold: 0 
    };

    const stats = {
      totalOrders,
      ordersByStatus: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      },
      paymentStats: {
        paidOrders,
        pendingPayment: totalOrders - paidOrders
      },
      revenue: {
        total: revenue.totalRevenue || 0,
        average: revenue.avgOrderValue || 0,
        itemsSold: revenue.totalItemsSold || 0
      },
      recentOrders
    };

    console.log('Supplier stats calculated:', {
      totalOrders,
      totalRevenue: revenue.totalRevenue,
      paidOrders
    });

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get supplier order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching supplier order statistics'
    });
  }
};


// @desc    Update order status by supplier
// @route   PUT /api/orders/supplier/:id/status
// @access  Private (Suppliers only)
exports.updateSupplierOrderStatus = async (req, res) => {
  try {
    console.log('=== UPDATE SUPPLIER ORDER STATUS ===');
    console.log('Order ID:', req.params.id);
    console.log('Supplier ID:', req.user._id);
    console.log('Request body:', req.body);

    const { status, note = '', trackingNumber = '' } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const hasSupplierItems = order.items.some(item => 
      item.supplier.toString() === req.user._id.toString()
    );

    if (!hasSupplierItems) {
      return res.status(403).json({
        success: false,
        message: 'You can only update orders containing your products'
      });
    }

    order.orderStatus = status;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status} by supplier`,
      updatedBy: req.user._id
    });

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('buyer', 'firstName lastName email')
      .populate('items.product', 'name images')
      .populate('items.supplier', 'firstName lastName profile.company')
      .lean();

    console.log(`Order status updated to: ${status}`);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Update supplier order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};