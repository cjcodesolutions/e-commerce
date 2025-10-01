// backend/controllers/searchController.js
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Search products with advanced filters
// @route   GET /api/search/products
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    console.log('=== PRODUCT SEARCH REQUEST ===');
    console.log('Query params:', req.query);

    const {
      q,                    // Search query
      category,             // Category filter
      minPrice,            // Minimum price
      maxPrice,            // Maximum price
      minOrderQuantity,    // MOQ filter
      supplier,            // Supplier ID
      sortBy = 'relevance', // Sort option
      page = 1,
      limit = 20
    } = req.query;

    // Build search query
    let searchQuery = { status: 'active' };

    // Text search on multiple fields
    if (q && q.trim()) {
      searchQuery.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
        { brand: { $regex: q.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(q.trim(), 'i')] } },
        { category: { $regex: q.trim(), $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      searchQuery.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }

    // MOQ filter
    if (minOrderQuantity) {
      searchQuery.minOrderQuantity = { $lte: parseInt(minOrderQuantity) };
    }

    // Supplier filter
    if (supplier) {
      searchQuery.supplier = supplier;
    }

    console.log('Search query:', JSON.stringify(searchQuery, null, 2));

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price_low':
        sortOptions = { price: 1 };
        break;
      case 'price_high':
        sortOptions = { price: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { views: -1 };
        break;
      case 'relevance':
      default:
        sortOptions = { createdAt: -1 }; // Default to newest if no text search
        break;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(searchQuery)
        .populate('supplier', 'firstName lastName email profile.company supplierInfo.rating')
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      Product.countDocuments(searchQuery)
    ]);

    console.log(`Found ${products.length} products out of ${total} total`);

    // Get available filters from results
    const categories = await Product.distinct('category', searchQuery);
    const priceRange = await Product.aggregate([
      { $match: searchQuery },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      products,
      filters: {
        categories,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
      }
    });

  } catch (error) {
    console.error('Product search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching products'
    });
  }
};

// @desc    Search suggestions (autocomplete)
// @route   GET /api/search/suggestions
// @access  Public
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        suggestions: []
      });
    }

    const regex = new RegExp(q.trim(), 'i');

    // Get product name suggestions
    const productSuggestions = await Product.find({
      status: 'active',
      name: regex
    })
      .select('name category')
      .limit(5)
      .lean();

    // Get category suggestions
    const categorySuggestions = await Product.distinct('category', {
      category: regex,
      status: 'active'
    });

    // Get brand suggestions
    const brandSuggestions = await Product.distinct('brand', {
      brand: regex,
      status: 'active'
    });

    const suggestions = {
      products: productSuggestions.map(p => ({
        type: 'product',
        text: p.name,
        category: p.category
      })),
      categories: categorySuggestions.slice(0, 3).map(c => ({
        type: 'category',
        text: c
      })),
      brands: brandSuggestions.filter(Boolean).slice(0, 3).map(b => ({
        type: 'brand',
        text: b
      }))
    };

    res.status(200).json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching suggestions'
    });
  }
};

// @desc    Search suppliers
// @route   GET /api/search/suppliers
// @access  Public
exports.searchSuppliers = async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 20
    } = req.query;

    let searchQuery = {
      userType: 'supplier',
      status: 'active'
    };

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      searchQuery.$or = [
        { firstName: regex },
        { lastName: regex },
        { 'profile.company': regex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [suppliers, total] = await Promise.all([
      User.find(searchQuery)
        .select('firstName lastName email profile supplierInfo')
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      User.countDocuments(searchQuery)
    ]);

    res.status(200).json({
      success: true,
      count: suppliers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      suppliers
    });

  } catch (error) {
    console.error('Supplier search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching suppliers'
    });
  }
};