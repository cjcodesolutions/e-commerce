// backend/controllers/analyticsController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.getSellerAnalytics = async (req, res) => {
  try {
    console.log('=== GET SELLER ANALYTICS ===');
    console.log('User ID:', req.user._id);
    console.log('User Type:', req.user.userType);
    
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const supplierId = req.user._id;

    // Total Revenue (current period)
    const revenueAggregation = await Order.aggregate([
      {
        $match: {
          'items.supplier': supplierId,
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.supplier': supplierId
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalOrders: { $addToSet: '$_id' }
        }
      }
    ]);

    const currentRevenue = revenueAggregation[0]?.totalRevenue || 0;
    const currentOrders = revenueAggregation[0]?.totalOrders?.length || 0;

    // Previous Period Revenue
    const previousRevenueAgg = await Order.aggregate([
      {
        $match: {
          'items.supplier': supplierId,
          createdAt: { $gte: previousStartDate, $lt: startDate }
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.supplier': supplierId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalOrders: { $addToSet: '$_id' }
        }
      }
    ]);

    const previousRevenue = previousRevenueAgg[0]?.totalRevenue || 0;
    const previousOrders = previousRevenueAgg[0]?.totalOrders?.length || 0;

    // Calculate percentage changes
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : 0;
    
    const ordersChange = previousOrders > 0
      ? ((currentOrders - previousOrders) / previousOrders * 100).toFixed(1)
      : 0;

    // Average Order Value
    const averageOrderValue = currentOrders > 0 ? currentRevenue / currentOrders : 0;

    // Product Stats
    const productStats = await Product.aggregate([
      { $match: { supplier: supplierId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
        }
      }
    ]);

    // Revenue Trend (daily)
    const revenueTrend = await Order.aggregate([
      { $match: { 'items.supplier': supplierId, createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      { $match: { 'items.supplier': supplierId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', revenue: 1 } }
    ]);

    // Orders by Status
    const ordersByStatus = await Order.aggregate([
      { $match: { 'items.supplier': supplierId, createdAt: { $gte: startDate } } },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', value: '$count' } }
    ]);

    // Top Products by Revenue
    const topProducts = await Order.aggregate([
      { $match: { 'items.supplier': supplierId, createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      { $match: { 'items.supplier': supplierId } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$productInfo.name' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          sales: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: 1, revenue: 1, sales: 1 } }
    ]);

    // Category Performance
    const categoryPerformance = await Order.aggregate([
      { $match: { 'items.supplier': supplierId, createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      { $match: { 'items.supplier': supplierId } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          sales: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } },
      { $project: { _id: 0, category: '$_id', revenue: 1, sales: 1 } }
    ]);

    // Recent Orders
    const recentOrders = await Order.find({
      'items.supplier': supplierId,
      createdAt: { $gte: startDate }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber createdAt totalAmount orderStatus')
      .lean();

    // Product Performance
    const productPerformance = await Product.aggregate([
      { $match: { supplier: supplierId } },
      {
        $project: {
          name: 1,
          views: 1,
          revenue: { $multiply: ['$price', { $ifNull: ['$orders', 0] }] },
          totalSales: { $ifNull: ['$orders', 0] }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Total Views and Inquiries
    const viewsAndInquiries = await Product.aggregate([
      { $match: { supplier: supplierId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalInquiries: { $sum: '$inquiries' }
        }
      }
    ]);

    const totalViews = viewsAndInquiries[0]?.totalViews || 1;
    const conversionRate = (currentOrders / totalViews * 100);

    const analytics = {
      totalRevenue: currentRevenue,
      totalOrders: currentOrders,
      averageOrderValue,
      totalProducts: productStats[0]?.totalProducts || 0,
      activeProducts: productStats[0]?.activeProducts || 0,
      previousRevenue,
      previousOrders,
      revenueChange: parseFloat(revenueChange),
      ordersChange: parseFloat(ordersChange),
      revenueTrend,
      ordersByStatus,
      topProducts,
      categoryPerformance,
      recentOrders,
      productPerformance,
      totalViews: viewsAndInquiries[0]?.totalViews || 0,
      totalInquiries: viewsAndInquiries[0]?.totalInquiries || 0,
      conversionRate
    };

    console.log('Analytics calculated successfully');

    res.status(200).json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Get seller analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics',
      error: error.message
    });
  }
};