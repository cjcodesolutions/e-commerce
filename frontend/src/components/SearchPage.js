import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Grid, 
  List, 
  ChevronDown,
  Star,
  Eye,
  ShoppingCart,
  ArrowLeft,
  Loader
} from 'lucide-react';

const SearchPage = () => {
  // Get search query from URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';
  const initialCategory = urlParams.get('category') || 'all';

  // State management
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [tempSearchQuery, setTempSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  // Filters
  const [filters, setFilters] = useState({
    category: initialCategory,
    minPrice: '',
    maxPrice: '',
    sortBy: 'relevance'
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Available filter options
  const [availableCategories, setAvailableCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ minPrice: 0, maxPrice: 0 });

  // Suggestions for autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Cart state
  const [cart, setCart] = useState([]);
  const [addToCartLoading, setAddToCartLoading] = useState({});

  // Notification
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart:', error);
        setCart([]);
      }
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        q: searchQuery,
        category: filters.category !== 'all' ? filters.category : '',
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy,
        page: page.toString(),
        limit: '24'
      });

      // Remove empty params
      [...queryParams.entries()].forEach(([key, value]) => {
        if (!value) queryParams.delete(key);
      });

      const response = await fetch(
        `http://localhost:5000/api/search/products?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(data.pages || 1);
        
        if (data.filters) {
          setAvailableCategories(data.filters.categories || []);
          setPriceRange(data.filters.priceRange || { minPrice: 0, maxPrice: 0 });
        }
      } else {
        showNotification('Failed to fetch products', 'error');
      }
    } catch (error) {
      console.error('Search error:', error);
      showNotification('Network error while searching', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, page]);

  // Fetch suggestions for autocomplete
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/search/suggestions?q=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allSuggestions = [
          ...(data.suggestions.products || []),
          ...(data.suggestions.categories || []),
          ...(data.suggestions.brands || [])
        ];
        setSuggestions(allSuggestions);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  }, []);

  // Debounced suggestion fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tempSearchQuery) {
        fetchSuggestions(tempSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [tempSearchQuery, fetchSuggestions]);

  // Fetch products when dependencies change
  useEffect(() => {
    if (searchQuery) {
      fetchProducts();
    }
  }, [searchQuery, filters, page, fetchProducts]);

  // Handle search
  const handleSearch = () => {
    setSearchQuery(tempSearchQuery);
    setPage(1);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setTempSearchQuery(suggestion.text);
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    setPage(1);
    
    if (suggestion.type === 'category') {
      setFilters(prev => ({ ...prev, category: suggestion.text }));
    }
  };

  // Add to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      setAddToCartLoading(prev => ({ ...prev, [product._id]: true }));

      const user = localStorage.getItem('user');
      
      if (user) {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/cart/add', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            productId: product._id,
            quantity,
            price: product.price
          })
        });

        if (response.ok) {
          const data = await response.json();
          setCart(data.cart.items || []);
          localStorage.setItem('cart', JSON.stringify(data.cart.items || []));
          showNotification('Product added to cart!', 'success');
        }
      } else {
        // Guest cart
        const existingItem = cart.find(item => item.product._id === product._id);
        let updatedCart;

        if (existingItem) {
          updatedCart = cart.map(item =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedCart = [...cart, {
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              images: product.images,
              supplier: product.supplier
            },
            quantity,
            price: product.price
          }];
        }

        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        showNotification('Product added to cart!', 'success');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      showNotification('Failed to add to cart', 'error');
    } finally {
      setAddToCartLoading(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const getCartItemCount = (productId) => {
    const item = cart.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  // Product Card Component
  const ProductCard = ({ product }) => {
    const cartItemCount = getCartItemCount(product._id);
    const isAddingToCart = addToCartLoading[product._id];

    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
        <div className="relative">
          <img 
            src={product.images?.[0] || 'https://via.placeholder.com/300x200'}
            alt={product.name}
            className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => window.location.href = `/product/${product._id}`}
          />
          {product.views && (
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded-full flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{product.views}</span>
            </div>
          )}
          {cartItemCount > 0 && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 text-xs font-bold rounded-full">
              {cartItemCount} in cart
            </div>
          )}
        </div>

        <div className="p-4">
          <h4 
            className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-orange-600 cursor-pointer"
            onClick={() => window.location.href = `/product/${product._id}`}
          >
            {product.name}
          </h4>

          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-orange-600">
              ${product.price}
            </span>
            <span className="text-xs text-gray-500">
              MOQ: {product.minOrderQuantity}
            </span>
          </div>

          <div className="mb-3">
            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded-full">
              {product.category}
            </span>
          </div>

          <button 
            onClick={() => addToCart(product, product.minOrderQuantity)}
            disabled={isAddingToCart}
            className={`w-full py-2 px-4 rounded-md transition-all text-sm font-medium flex items-center justify-center space-x-2 ${
              isAddingToCart
                ? 'bg-orange-400 text-white cursor-not-allowed'
                : cartItemCount > 0
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {isAddingToCart ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>{cartItemCount > 0 ? `Add More (${cartItemCount})` : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification.message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = '/welcome'}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="relative">
                <input
                  type="text"
                  value={tempSearchQuery}
                  onChange={(e) => {
                    setTempSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span>{suggestion.text}</span>
                      <span className="text-xs text-gray-500">({suggestion.type})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={handleSearch}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Count and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Search Results {searchQuery && `for "${searchQuery}"`}
            </h2>
            <p className="text-gray-600 mt-1">
              {loading ? 'Searching...' : `${total} products found`}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, category: e.target.value }));
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Categories</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, sortBy: e.target.value }));
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="relevance">Most Relevant</option>
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center bg-white rounded-lg border">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-12 h-12 animate-spin text-orange-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setTempSearchQuery('');
                setFilters({ category: 'all', minPrice: '', maxPrice: '', sortBy: 'relevance' });
              }}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;