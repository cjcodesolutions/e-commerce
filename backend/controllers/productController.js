// backend/controllers/productController.js
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Suppliers only)
exports.createProduct = async (req, res) => {
  try {
    console.log('=== CREATE PRODUCT REQUEST ===');
    console.log('User:', req.user._id);
    console.log('Request body:', req.body);

    // Check if user is a supplier
    if (req.user.userType !== 'supplier') {
      return res.status(403).json({
        success: false,
        message: 'Only suppliers can create products'
      });
    }

    // Add seller to product data
    const productData = {
      ...req.body,
      seller: req.user._id
    };

    // Validate required fields
    if (!productData.name || !productData.description || !productData.category || 
        !productData.price || !productData.unit || !productData.minOrderQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate images
    if (!productData.images || productData.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required'
      });
    }

    console.log('Creating product with data:', productData);
    const product = await Product.create(productData);

    console.log('Product created successfully:', product._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Create product error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A product with this information already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
};

// @desc    Get all products for current seller
// @route   GET /api/products/seller/my-products
// @access  Private (Suppliers only)
exports.getSellerProducts = async (req, res) => {
  try {
    console.log('=== GET SELLER PRODUCTS ===');
    console.log('Seller ID:', req.user._id);

    const { status, category, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    // Build query
    const query = { seller: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }

    console.log('Query:', query);

    // Execute query with pagination - DON'T populate seller to avoid User model transform error
    const products = await Product.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean(); // Use lean() to get plain objects instead of Mongoose documents

    const total = await Product.countDocuments(query);

    console.log(`Found ${products.length} products out of ${total} total`);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      products
    });

  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    console.log('=== GET SINGLE PRODUCT ===');
    console.log('Product ID:', req.params.id);

    const product = await Product.findById(req.params.id)
      .populate('seller', 'firstName lastName email profile.company profile.avatar supplierInfo.rating');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment views (don't await to avoid slowing response)
    product.incrementViews().catch(err => console.error('Error incrementing views:', err));

    console.log('Product found:', product.name);

    res.status(200).json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Get product error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Suppliers only - own products)
exports.updateProduct = async (req, res) => {
  try {
    console.log('=== UPDATE PRODUCT ===');
    console.log('Product ID:', req.params.id);
    console.log('User ID:', req.user._id);

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns this product
    if (!product.canEdit(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    console.log('Updating product with data:', req.body);

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('seller', 'firstName lastName email');

    console.log('Product updated successfully');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    console.error('Update product error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Suppliers only - own products)
exports.deleteProduct = async (req, res) => {
  try {
    console.log('=== DELETE PRODUCT ===');
    console.log('Product ID:', req.params.id);
    console.log('User ID:', req.user._id);

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns this product
    if (!product.canEdit(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    console.log('Product deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
};

// @desc    Get all products with filtering and search
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    console.log('=== GET ALL PRODUCTS ===');
    console.log('Query params:', req.query);

    const {
      search,
      category,
      minPrice,
      maxPrice,
      status = 'active',
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = { status };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    console.log('Final query:', query);

    // Execute query
    let productsQuery = Product.find(query)
      .populate('seller', 'firstName lastName profile.company supplierInfo.rating')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Apply sorting
    if (search && query.$text) {
      productsQuery = productsQuery.sort({ score: { $meta: 'textScore' }, [sort]: -1 });
    } else {
      productsQuery = productsQuery.sort(sort);
    }

    const products = await productsQuery;
    const total = await Product.countDocuments(query);

    console.log(`Found ${products.length} products out of ${total} total`);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      products
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
};

// @desc    Get product analytics for seller
// @route   GET /api/products/analytics/seller
// @access  Private (Suppliers only)
exports.getSellerAnalytics = async (req, res) => {
  try {
    console.log('=== GET SELLER ANALYTICS ===');
    console.log('Seller ID:', req.user._id);

    const sellerId = req.user._id;

    // Aggregate analytics data
    const analytics = await Product.aggregate([
      { $match: { seller: sellerId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { 
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } 
          },
          totalViews: { $sum: '$views' },
          totalInquiries: { $sum: '$inquiries' },
          totalSales: { $sum: '$sales' },
          avgRating: { $avg: '$rating.average' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      }
    ]);

    const result = analytics[0] || {
      totalProducts: 0,
      activeProducts: 0,
      totalViews: 0,
      totalInquiries: 0,
      totalSales: 0,
      avgRating: 0,
      totalValue: 0
    };

    // Get category breakdown
    const categoryStats = await Product.aggregate([
      { $match: { seller: sellerId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          views: { $sum: '$views' },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get top performing products
    const topProducts = await Product.find({ seller: sellerId })
      .sort({ views: -1 })
      .limit(5)
      .select('name views inquiries rating.average price');

    console.log('Analytics calculated successfully');

    res.status(200).json({
      success: true,
      analytics: result,
      categoryStats,
      topProducts
    });

  } catch (error) {
    console.error('Get seller analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
};

// @desc    Bulk update product status
// @route   PATCH /api/products/bulk-status
// @access  Private (Suppliers only)
exports.bulkUpdateStatus = async (req, res) => {
  try {
    console.log('=== BULK UPDATE STATUS ===');
    console.log('User ID:', req.user._id);
    console.log('Request body:', req.body);

    const { productIds, status } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid product IDs'
      });
    }

    if (!status || !['active', 'inactive', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status'
      });
    }

    // Update only products owned by the current user
    const result = await Product.updateMany(
      { 
        _id: { $in: productIds }, 
        seller: req.user._id 
      },
      { status },
      { runValidators: true }
    );

    console.log(`Updated ${result.modifiedCount} products`);

    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} products`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk update'
    });
  }
};