import React, { useState, useEffect } from 'react';
import { Search, Camera, ChevronRight, User, ShoppingCart, MessageCircle, Globe, Bell } from 'lucide-react';

const Welcome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('products');
  const [currentItemSet, setCurrentItemSet] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Navigation helper function
  const navigate = (path, params = {}) => {
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params).toString();
      window.location.href = `${path}?${searchParams}`;
    } else {
      window.location.href = path;
    }
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

      {/* Main Content */}
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
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg p-8 text-white">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;