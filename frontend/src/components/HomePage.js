import React, { useState } from 'react';
import { Search, ShoppingCart, User, Globe, Star, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleContactSupplier = () => {
    // Navigate to signup page
    window.location.href = '/signup';
  };

   const handleSignIn = () => {
    window.location.href = '/login';
  };

  const handleJoinFree = () => {
    window.location.href = '/signup';
  };

  const categories = [
    { name: 'Electronics', icon: '📱' },
    { name: 'Fashion', icon: '👗' },
    { name: 'Home & Garden', icon: '🏠' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Automotive', icon: '🚗' },
    { name: 'Beauty', icon: '💄' }
  ];

  const featuredProducts = [
    { id: 1, name: 'Wireless Earbuds', price: '$29.99', image: '🎧', rating: 4.5 },
    { id: 2, name: 'Smart Watch', price: '$89.99', image: '⌚', rating: 4.7 },
    { id: 3, name: 'Laptop Stand', price: '$19.99', image: '💻', rating: 4.3 },
    { id: 4, name: 'LED Strip Lights', price: '$15.99', image: '💡', rating: 4.6 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        {/* Top Bar */}
        <div className="bg-orange-500 text-white py-2">
          <div className="max-w-6xl mx-auto px-4 flex justify-between items-center text-sm">
            <span>🎉 Welcome to TradeHub - Your Global Marketplace!</span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center"><Globe className="w-4 h-4 mr-1" />English</span>
              <span>Help</span>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-orange-500">TradeHub</h1>
              <span className="text-sm text-gray-500 ml-2">.com</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-orange-500 cursor-pointer" />
              <div className="flex items-center space-x-2 cursor-pointer">
                <User className="w-6 h-6 text-gray-600" />
                <div className="text-sm flex items-center space-x-2">
                  <button 
                    onClick={handleSignIn}
                    className="text-gray-600 hover:text-orange-500"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={handleJoinFree}
                    className="text-blue-600 hover:underline"
                  >
                    Join Free
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Categories */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-8 overflow-x-auto">
            {categories.map((category, index) => (
              <button
                key={index}
                className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100 whitespace-nowrap"
              >
                <span className="text-xl">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative h-96 bg-gray-900 text-white">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              The leading ecommerce platform for global trade
            </h1>
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="flex max-w-lg">
                <input
                  type="text"
                  placeholder="Search for products, suppliers..."
                  className="flex-1 px-4 py-3 text-gray-900 rounded-l-lg border-0 focus:outline-none"
                />
                <button className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-r-lg">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Frequently Searched */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm">Frequently searched:</span>
              {['iphones 15 pro max', 'labubu', 'watch', "women's intimates"].map((term, index) => (
                <button
                  key={index}
                  className="px-3 py-1 text-sm border border-gray-400 rounded-full hover:border-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-500">10M+</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500">200K+</div>
              <div className="text-sm text-gray-600">Suppliers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500">180+</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500">$50B+</div>
              <div className="text-sm text-gray-600">Trade Volume</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800">Featured Products</h3>
            <button className="text-orange-500 hover:text-orange-600 flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h4 className="font-semibold text-gray-800 mb-2">{product.name}</h4>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-orange-500">{product.price}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{product.rating}</span>
                  </div>
                </div>
                <button 
                  onClick={handleContactSupplier}
                  className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Contact Supplier
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-12">Why Choose TradeHub?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="text-5xl mb-4">🛡️</div>
              <h4 className="text-xl font-semibold mb-3">Secure Trading</h4>
              <p className="text-gray-600">Protected payments and verified suppliers ensure safe transactions.</p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="text-5xl mb-4">🌍</div>
              <h4 className="text-xl font-semibold mb-3">Global Reach</h4>
              <p className="text-gray-600">Connect with suppliers from 180+ countries worldwide.</p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="text-5xl mb-4">💎</div>
              <h4 className="text-xl font-semibold mb-3">Quality Products</h4>
              <p className="text-gray-600">Verified suppliers offering high-quality products at competitive prices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">TradeHub</h4>
              <p className="text-gray-400">Your trusted global B2B marketplace connecting buyers and suppliers worldwide.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Buyers</h5>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white text-left">Search Products</button></li>
                <li><button className="hover:text-white text-left">Request Quotes</button></li>
                <li><button className="hover:text-white text-left">Trade Assurance</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Suppliers</h5>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white text-left">Sell on TradeHub</button></li>
                <li><button className="hover:text-white text-left">Supplier Membership</button></li>
                <li><button className="hover:text-white text-left">Learning Center</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white text-left">Help Center</button></li>
                <li><button className="hover:text-white text-left">Contact Us</button></li>
                <li><button className="hover:text-white text-left">Report Issues</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TradeHub.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;