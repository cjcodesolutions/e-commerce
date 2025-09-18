import React, { useState, useEffect } from 'react';
import { Search, Camera, ChevronRight, User, ShoppingCart, MessageCircle, Globe, Bell, Star, Eye, ArrowRight, Filter, Grid, List } from 'lucide-react';

const Welcome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('products');
  const [currentItemSet, setCurrentItemSet] = useState(0);
  const [user, setUser] = useState(null);
  
  // Product showcase states
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productViewMode, setProductViewMode] = useState('grid'); // 'grid' or 'list'
  const [productFilter, setProductFilter] = useState('all'); // 'all', 'Electronics', 'Fashion', etc.
  const [productSort, setProductSort] = useState('newest'); // 'newest', 'price_low', 'price_high', 'popular'

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Fetch products when component mounts
    fetchProducts();
  }, []);

  // Fetch products from backend
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      console.log('Fetching products for showcase...');
      
      const response = await fetch('http://localhost:5000/api/products?status=active&limit=12', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Products fetched:', data);
        setProducts(data.products || []);
      } else {
        console.error('Failed to fetch products:', response.status);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = products;
    
    // Apply category filter
    if (productFilter !== 'all') {
      filtered = products.filter(product => product.category === productFilter);
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (productSort) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    
    return sorted;
  }, [products, productFilter, productSort]);

  // Get unique categories from products
  const availableCategories = React.useMemo(() => {
    const categories = [...new Set(products.map(p => p.category))];
    return categories.filter(Boolean);
  }, [products]);

  // Navigation helper function
  const navigate = (path, params = {}) => {
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params).toString();
      window.location.href = `${path}?${searchParams}`;
    } else {
      window.location.href = path;
    }
  };

  const handleProductClick = (product) => {
    // Navigate to product detail page
    navigate(`/product/${product._id}`);
  };

  const handleSupplierClick = (supplier) => {
    // Navigate to supplier profile
    navigate(`/supplier/${supplier._id}`);
  };

  const categories = [
    { name: 'Apparel & Accessories', icon: '👕', hasSubmenu: true, route: '/categories/apparel' },
    { name: 'Consumer Electronics', icon: '📱', hasSubmenu: true, route: '/categories/electronics' },
    { name: 'Sports & Entertainment', icon: '⚽', hasSubmenu: true, route: '/categories/sports' },
    { name: 'Beauty', icon: '💄', hasSubmenu: true, route: '/categories/beauty' },
    { name: 'Jewelry, Eyewear & Watches', icon: '💎', hasSubmenu: true, route: '/categories/jewelry' },
    { name: 'Home & Garden', icon: '🏠', hasSubmenu: true, route: '/categories/home-garden' },
    { name: 'Machinery', icon: '⚙️', hasSubmenu: true, route: '/categories/machinery' },
    { name: 'Vehicles & Transportation', icon: '🚗', hasSubmenu: true, route: '/categories/vehicles' }
  ];

  const frequentlySearchedSets = [
    {
      Cars: {
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop',
        items: ['Electric cars', 'SUV', 'Sedan', 'Sports car']
      },
      Laptops: {
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop',
        items: ['Gaming laptop', 'Business laptop', 'Ultrabook', '2-in-1 laptop']
      },
      'Smart Watches': {
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop',
        items: ['Apple Watch', 'Samsung Galaxy', 'Fitness tracker', 'Smartwatch bands']
      }
    },
    {
      Smartphones: {
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop',
        items: ['iPhone 15', 'Samsung Galaxy', 'Google Pixel', 'OnePlus']
      },
      Furniture: {
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
        items: ['Office chair', 'Dining table', 'Sofa set', 'Bedroom furniture']
      },
      Headphones: {
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
        items: ['Wireless earbuds', 'Gaming headset', 'Studio monitors', 'Bluetooth speakers']
      }
    },
    {
      Fashion: {
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop',
        items: ['T-shirts', 'Jeans', 'Sneakers', 'Jackets']
      },
      'Home Appliances': {
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
        items: ['Air conditioner', 'Refrigerator', 'Washing machine', 'Microwave']
      },
      Sports: {
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
        items: ['Gym equipment', 'Basketball', 'Running shoes', 'Yoga mats']
      }
    }
  ];

  // Auto-rotate frequently searched items every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentItemSet((prev) => (prev + 1) % frequentlySearchedSets.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [frequentlySearchedSets.length]);

  const topSearches = [
    'iphones 15 pro max', 'labubu', 'watch', "women's intimates", 
    'electric bike', 'smart watch', 'mobile phones', 'laptop'
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate('/search', { q: searchQuery, type: searchType });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTopSearchClick = (term) => {
    navigate('/search', { q: term });
  };

  const handleCategorySearch = (category, item) => {
    navigate('/search', { q: item, category: category.toLowerCase() });
  };

  const handleImageSearch = () => {
    navigate('/search/image');
  };

  const handleUserAction = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const quickActions = [
    { icon: '💼', name: 'Post Buying Request', route: '/post-request' },
    { icon: '🔍', name: 'Find Suppliers', route: '/suppliers' },
    { icon: '📊', name: 'Market Analysis', route: '/market-analysis' },
    { icon: '🚚', name: 'Logistics Solutions', route: '/logistics' }
  ];

  // Product Card Component
  const ProductCard = ({ product }) => {
    const supplierName = product.supplier ? 
      `${product.supplier.firstName || ''} ${product.supplier.lastName || ''}`.trim() : 
      'Unknown Supplier';
    
    const companyName = product.supplier?.profile?.company || '';
    const rating = product.supplier?.supplierInfo?.rating?.average || 0;

    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 group">
        {/* Product Image */}
        <div className="relative overflow-hidden">
          <img 
            src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => handleProductClick(product)}
          />
          {product.status === 'active' && (
            <div className="absolute top-2 right-2">
              <span className="bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                Available
              </span>
            </div>
          )}
          {product.views && (
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded-full flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{product.views}</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Product Name */}
          <h4 
            className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-orange-600 cursor-pointer transition-colors"
            onClick={() => handleProductClick(product)}
          >
            {product.name}
          </h4>

          {/* Price and MOQ */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-orange-600">
                ${product.price}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                /{product.unit}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              MOQ: {product.minOrderQuantity}
            </div>
          </div>

          {/* Category */}
          <div className="mb-3">
            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded-full">
              {product.category}
            </span>
          </div>

          {/* Supplier Info */}
          <div className="border-t border-gray-100 pt-3">
            <div 
              className="flex items-center justify-between cursor-pointer hover:text-orange-600 transition-colors"
              onClick={() => handleSupplierClick(product.supplier)}
            >
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {supplierName}
                </p>
                {companyName && (
                  <p className="text-xs text-gray-500 truncate">
                    {companyName}
                  </p>
                )}
              </div>
              {rating > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Button */}
          <button 
            onClick={() => navigate(`/contact-supplier/${product.supplier?._id}`, { productId: product._id })}
            className="w-full mt-3 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            Contact Supplier
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white">
        {/* Top Bar */}
        <div className="bg-gray-100 border-b">
          <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                Deliver to: <img src="https://flagcdn.com/w20/lk.png" alt="LK" className="ml-1 w-5 h-3" /> LK
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="flex items-center space-x-1 hover:text-orange-500"
                onClick={() => navigate('/language-currency')}
              >
                <Globe className="w-4 h-4" />
                <span>English-USD</span>
              </button>
              <button onClick={() => navigate('/messages')} className="hover:text-orange-500">
                <MessageCircle className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/notifications')} className="hover:text-orange-500">
                <Bell className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/cart')} className="hover:text-orange-500">
                <ShoppingCart className="w-4 h-4" />
              </button>
              <button onClick={handleUserAction} className="hover:text-orange-500">
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="bg-orange-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Logo */}
            <div className="mb-4">
              <button onClick={() => navigate('/')} className="text-3xl font-bold hover:text-orange-100">
                TradeHub.com
              </button>
            </div>

            {/* Search Section */}
            <div className="max-w-4xl">
              <div className="flex mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="labubu 🚀 in LK"
                  className="flex-1 px-4 py-3 text-gray-900 rounded-l-lg border-0 focus:outline-none text-lg"
                />
                <div className="flex">
                  <button 
                    onClick={handleImageSearch}
                    className="px-4 py-3 bg-white text-gray-600 border-l border-gray-300 hover:bg-gray-50"
                    title="Image Search"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleSearch}
                    className="px-8 py-3 bg-black text-white rounded-r-lg hover:bg-gray-800 font-medium"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Search Options */}
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => setSearchType('products')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded ${
                    searchType === 'products' ? 'bg-white text-orange-500' : 'text-white border border-white'
                  }`}
                >
                  <span className="text-lg">🔥</span>
                  <span>Deep Search</span>
                  <span className="text-xs bg-green-500 text-white px-1 rounded">Free</span>
                </button>
                <button 
                  onClick={handleImageSearch}
                  className="flex items-center space-x-2 text-white hover:text-orange-100"
                >
                  <Camera className="w-4 h-4" />
                  <span>Image Search</span>
                </button>
              </div>

              {/* Frequently Searched */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-white text-sm">Frequently searched:</span>
                {topSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleTopSearchClick(term)}
                    className="px-3 py-1 text-sm border border-white/30 rounded-full hover:bg-white/10 text-white transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h2 className="text-xl">Welcome to TradeHub.com, {user?.firstName || 'User'}</h2>
          
          {/* Service Icons */}
          <div className="flex items-center space-x-8 mt-4">
            <button 
              onClick={() => navigate('/ai-assistant')}
              className="flex items-center space-x-2 hover:text-orange-500 transition-colors"
            >
              <span className="text-2xl">🔬</span>
              <span className="text-sm">Accio AI</span>
            </button>
            <button 
              onClick={() => navigate('/rfq')}
              className="flex items-center space-x-2 hover:text-orange-500 transition-colors"
            >
              <span className="text-2xl">💬</span>
              <span className="text-sm">Request for Quotation</span>
            </button>
            <button 
              onClick={() => navigate('/customization')}
              className="flex items-center space-x-2 hover:text-orange-500 transition-colors"
            >
              <span className="text-2xl">⚡</span>
              <span className="text-sm">Fast customization</span>
            </button>
            <button 
              onClick={() => navigate('/logistics')}
              className="flex items-center space-x-2 hover:text-orange-500 transition-colors"
            >
              <span className="text-2xl">🚚</span>
              <span className="text-sm">TradeHub.com Logistics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Upper Section with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-2 border-b">
                <h3 className="font-semibold flex items-center">
                  <span className="text-lg mr-2">⭐</span>
                  Categories for you
                </h3>
              </div>
              <div className="p-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(category.route)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded text-left transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    {category.hasSubmenu && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Frequently Searched Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {Object.entries(frequentlySearchedSets[currentItemSet]).map(([category, data]) => (
                <div key={category} className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-500 ease-in-out">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-800">
                      Frequently searched
                    </h3>
                    <p className="text-sm text-gray-600">{category}</p>
                  </div>
                  <div className="p-4">
                    <button 
                      onClick={() => navigate('/search', { q: category })}
                      className="w-full"
                    >
                      <img 
                        src={data.image} 
                        alt={category}
                        className="w-full h-32 object-cover rounded-lg mb-3 transition-opacity duration-500 hover:opacity-90"
                      />
                    </button>
                    <div className="space-y-1">
                      {data.items.map((item, index) => (
                        <button 
                          key={index}
                          onClick={() => handleCategorySearch(category, item)}
                          className="block text-sm text-blue-600 hover:underline transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promotional Banner */}
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg p-8 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Dispatch in 7 days</h2>
                  <p className="text-purple-100 mb-4">Fast delivery for your urgent orders</p>
                  <button 
                    onClick={() => navigate('/fast-delivery')}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    View more
                  </button>
                </div>
                <div className="text-6xl">
                  📦
                </div>
              </div>
              
              {/* Progress indicators */}
              <div className="flex space-x-2 mt-6">
                {[1,2,3,4,5,6,7].map((dot, index) => (
                  <div 
                    key={dot}
                    className={`w-2 h-2 rounded-full ${
                      index < 3 ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button 
                    key={index}
                    onClick={() => navigate(action.route)}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded flex items-center space-x-3 transition-colors"
                  >
                    <span className="text-lg">{action.icon}</span>
                    <span className="text-sm">{action.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Actions */}
            <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
              <h3 className="font-semibold mb-4">For Business</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/sell-on-tradehub')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded flex items-center space-x-3 transition-colors"
                >
                  <span className="text-lg">🏪</span>
                  <span className="text-sm">Sell on TradeHub</span>
                </button>
                <button 
                  onClick={() => navigate('/business-account')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded flex items-center space-x-3 transition-colors"
                >
                  <span className="text-lg">💼</span>
                  <span className="text-sm">Business Account</span>
                </button>
                <button 
                  onClick={() => navigate('/trade-assurance')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded flex items-center space-x-3 transition-colors"
                >
                  <span className="text-lg">🛡️</span>
                  <span className="text-sm">Trade Assurance</span>
                </button>
              </div>
            </div>

            {/* Featured Categories from Products */}
            {availableCategories.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <span className="text-lg mr-2">🔥</span>
                  Popular Categories
                </h3>
                <div className="space-y-2">
                  {availableCategories.slice(0, 5).map((category, index) => {
                    const categoryCount = products.filter(p => p.category === category).length;
                    return (
                      <button
                        key={category}
                        onClick={() => {
                          setProductFilter(category);
                          // Scroll to products section
                          document.querySelector('.product-showcase-section')?.scrollIntoView({ 
                            behavior: 'smooth' 
                          });
                        }}
                        className="w-full text-left p-2 hover:bg-orange-50 rounded flex items-center justify-between transition-colors group"
                      >
                        <span className="text-sm group-hover:text-orange-600">{category}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {categoryCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {availableCategories.length > 5 && (
                  <button 
                    onClick={() => navigate('/categories')}
                    className="w-full text-center text-sm text-orange-600 hover:text-orange-700 mt-3 py-2 border-t border-gray-100"
                  >
                    View All Categories
                  </button>
                )}
              </div>
            )}

            {/* Recently Added Products */}
            {products.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <span className="text-lg mr-2">⏰</span>
                  Recently Added
                </h3>
                <div className="space-y-3">
                  {products.slice(0, 3).map((product, index) => (
                    <div 
                      key={product._id}
                      onClick={() => handleProductClick(product)}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                    >
                      <img 
                        src={product.images?.[0] || 'https://via.placeholder.com/40x40'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-orange-600 font-medium">
                          ${product.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => navigate('/products?sort=newest')}
                  className="w-full text-center text-sm text-orange-600 hover:text-orange-700 mt-3 py-2 border-t border-gray-100"
                >
                  View All Recent
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Width Product Showcase Section */}
      <div className="product-showcase-section bg-white mt-8">
        {/* Section Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-3">Latest Products from Our Sellers</h2>
              <p className="text-xl text-orange-100 max-w-3xl mx-auto">
                Discover amazing products from verified suppliers worldwide - Browse thousands of quality items at competitive prices
              </p>
              <div className="flex justify-center items-center mt-4 space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">🌍</div>
                  <span className="text-orange-100">Global Suppliers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">✅</div>
                  <span className="text-orange-100">Verified Products</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">🚚</div>
                  <span className="text-orange-100">Fast Shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">💎</div>
                  <span className="text-orange-100">Best Prices</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Controls */}
        <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Left Side - Filters */}
              <div className="flex items-center space-x-4">
                {/* Product Count */}
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                  <span className="text-sm font-medium text-gray-700">
                    {filteredAndSortedProducts.length} Products
                  </span>
                </div>

                {/* Category Filter */}
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white shadow-sm min-w-[200px]"
                >
                  <option value="all">🏷️ All Categories</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>
                      📦 {category}
                    </option>
                  ))}
                </select>

                {/* Sort Options */}
                <select
                  value={productSort}
                  onChange={(e) => setProductSort(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white shadow-sm min-w-[180px]"
                >
                  <option value="newest">🆕 Newest First</option>
                  <option value="price_low">💰 Price: Low to High</option>
                  <option value="price_high">💎 Price: High to Low</option>
                  <option value="popular">🔥 Most Popular</option>
                </select>

                {/* Quick Filter Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setProductSort('popular')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      productSort === 'popular'
                        ? 'bg-orange-100 text-orange-700 border border-orange-300'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    🔥 Popular
                  </button>
                  <button
                    onClick={() => setProductSort('newest')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      productSort === 'newest'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    ✨ New
                  </button>
                </div>
              </div>

              {/* Right Side - View Controls */}
              <div className="flex items-center space-x-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-white rounded-lg border border-gray-300 shadow-sm">
                  <button
                    onClick={() => setProductViewMode('grid')}
                    className={`p-2 rounded-l-lg transition-colors ${
                      productViewMode === 'grid' 
                        ? 'bg-orange-100 text-orange-600 border-r border-orange-300' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setProductViewMode('list')}
                    className={`p-2 rounded-r-lg transition-colors ${
                      productViewMode === 'list' 
                        ? 'bg-orange-100 text-orange-600 border-l border-orange-300' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Refresh Button */}
                <button 
                  onClick={fetchProducts}
                  disabled={productsLoading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
                  title="Refresh Products"
                >
                  {productsLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  ) : (
                    '🔄 Refresh'
                  )}
                </button>

                {/* View All Button */}
                <button 
                  onClick={() => navigate('/products')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all text-sm font-medium flex items-center space-x-2 shadow-lg"
                >
                  <span>View All Products</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tags */}
            {(productFilter !== 'all' || productSort !== 'newest') && (
              <div className="flex items-center space-x-2 mt-3">
                <span className="text-sm text-gray-500">Active filters:</span>
                {productFilter !== 'all' && (
                  <span className="inline-flex items-center bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    Category: {productFilter}
                    <button
                      onClick={() => setProductFilter('all')}
                      className="ml-1 hover:text-orange-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {productSort !== 'newest' && (
                  <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Sort: {productSort.replace('_', ' ')}
                    <button
                      onClick={() => setProductSort('newest')}
                      className="ml-1 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setProductFilter('all');
                    setProductSort('newest');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Full Width Products Display */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {productsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Amazing Products...</h3>
                <p className="text-gray-500">Discovering the best deals from our global suppliers</p>
              </div>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">🏪</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Products Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {productFilter !== 'all' 
                  ? `No products found in "${productFilter}" category. Try selecting a different category or explore all products.`
                  : 'No products available at the moment. Our suppliers are constantly adding new items, so please check back soon!'
                }
              </p>
              <div className="flex justify-center space-x-4">
                {productFilter !== 'all' && (
                  <button
                    onClick={() => setProductFilter('all')}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    Show All Products
                  </button>
                )}
                <button
                  onClick={fetchProducts}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className={`grid gap-6 ${
                productViewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' 
                  : 'grid-cols-1 max-w-4xl mx-auto'
              }`}>
                {filteredAndSortedProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Load More / Pagination */}
              {products.length > filteredAndSortedProducts.length && (
                <div className="text-center mt-12">
                  <p className="text-gray-600 mb-6">
                    Showing {filteredAndSortedProducts.length} of {products.length} products
                  </p>
                  <button 
                    onClick={() => navigate('/products', { 
                      category: productFilter !== 'all' ? productFilter : undefined,
                      sort: productSort 
                    })}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-10 py-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-semibold text-lg flex items-center space-x-3 mx-auto shadow-xl transform hover:scale-105"
                  >
                    <span>Explore All Products</span>
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Enhanced Product Statistics */}
              <div className="mt-16 pt-12 border-t border-gray-200">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Why Choose TradeHub?</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Join millions of buyers and suppliers who trust TradeHub for their business needs
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{products.length}+</div>
                    <div className="text-sm text-blue-700 font-medium">Quality Products</div>
                    <div className="text-xs text-blue-600 mt-1">Verified & Tested</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                    <div className="text-3xl font-bold text-green-600 mb-2">{availableCategories.length}+</div>
                    <div className="text-sm text-green-700 font-medium">Categories</div>
                    <div className="text-xs text-green-600 mt-1">All Industries</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {[...new Set(products.map(p => p.supplier?._id).filter(Boolean))].length}+
                    </div>
                    <div className="text-sm text-purple-700 font-medium">Verified Suppliers</div>
                    <div className="text-xs text-purple-600 mt-1">Global Network</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                    <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                    <div className="text-sm text-orange-700 font-medium">Support</div>
                    <div className="text-xs text-orange-600 mt-1">Always Here</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                    <div className="text-3xl font-bold text-red-600 mb-2">180+</div>
                    <div className="text-sm text-red-700 font-medium">Countries</div>
                    <div className="text-xs text-red-600 mt-1">Global Reach</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                    <div className="text-3xl font-bold text-teal-600 mb-2">99%</div>
                    <div className="text-sm text-teal-700 font-medium">Satisfaction</div>
                    <div className="text-xs text-teal-600 mt-1">Happy Buyers</div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="text-center mt-12">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
                    <h4 className="text-2xl font-bold mb-3">Ready to Start Trading?</h4>
                    <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
                      Join thousands of successful businesses who have found their perfect suppliers on TradeHub
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button 
                        onClick={() => navigate('/signup')}
                        className="bg-white text-orange-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                      >
                        Start Buying
                      </button>
                      <button 
                        onClick={() => navigate('/sell-on-tradehub')}
                        className="bg-orange-700 text-white px-8 py-3 rounded-lg hover:bg-orange-800 transition-colors font-semibold"
                      >
                        Start Selling
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">TradeHub</h4>
              <p className="text-gray-400 mb-4">
                Your trusted global B2B marketplace connecting buyers and suppliers worldwide.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">For Buyers</h5>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white text-left">Search Products</button></li>
                <li><button className="hover:text-white text-left">Request Quotes</button></li>
                <li><button className="hover:text-white text-left">Trade Assurance</button></li>
                <li><button className="hover:text-white text-left">Buyer Protection</button></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">For Suppliers</h5>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate('/seller-dashboard')} className="hover:text-white text-left">Sell on TradeHub</button></li>
                <li><button className="hover:text-white text-left">Supplier Membership</button></li>
                <li><button className="hover:text-white text-left">Learning Center</button></li>
                <li><button className="hover:text-white text-left">Success Stories</button></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white text-left">Help Center</button></li>
                <li><button className="hover:text-white text-left">Contact Us</button></li>
                <li><button className="hover:text-white text-left">Report Issues</button></li>
                <li><button className="hover:text-white text-left">Community</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm">
                &copy; 2025 TradeHub.com. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <button className="text-gray-400 hover:text-white text-sm">Privacy Policy</button>
                <button className="text-gray-400 hover:text-white text-sm">Terms of Service</button>
                <button className="text-gray-400 hover:text-white text-sm">Cookies</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;