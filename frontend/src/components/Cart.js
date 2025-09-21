import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard, AlertCircle } from 'lucide-react';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchCart();
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        loadGuestCart();
      }
    } else {
      loadGuestCart();
    }
  }, []);

  const loadGuestCart = () => {
    try {
      const guestCart = localStorage.getItem('cart');
      if (guestCart) {
        const cartItems = JSON.parse(guestCart);
        setCart({
          items: cartItems,
          totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        });
      }
    } catch (error) {
      console.error('Error loading guest cart:', error);
      localStorage.removeItem('cart');
    }
    setLoading(false);
  };

  const fetchCart = async () => {
    try {
      console.log('Fetching cart from database...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, loading guest cart');
        loadGuestCart();
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Cart fetch response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Cart data received:', data);
        
        if (data.success && data.cart) {
          setCart(data.cart);
          // Sync with localStorage for consistency
          localStorage.setItem('cart', JSON.stringify(data.cart.items || []));
          setError('');
        } else {
          console.error('Invalid cart data structure:', data);
          setError('Failed to load cart data');
        }
      } else {
        console.error('Failed to fetch cart:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('Error response:', errorData);
        
        if (response.status === 401) {
          // Token might be expired, clear it and load guest cart
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          loadGuestCart();
          return;
        }
        
        setError(`Failed to load cart: ${response.status} ${response.statusText}`);
        loadGuestCart(); // Fallback to guest cart
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError(`Network error: ${error.message}`);
      loadGuestCart(); // Fallback to guest cart
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 0) return;
    
    setUpdating(prev => ({ ...prev, [productId]: true }));

    try {
      if (user) {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/cart/update', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            productId,
            quantity: newQuantity
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.cart) {
            setCart(data.cart);
            localStorage.setItem('cart', JSON.stringify(data.cart.items || []));
          }
        } else {
          console.error('Failed to update cart:', response.status);
          setError('Failed to update item quantity');
        }
      } else {
        // Update guest cart
        const updatedItems = cart.items.map(item =>
          item.product._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        ).filter(item => item.quantity > 0);

        const updatedCart = {
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update item quantity');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeItem = async (productId) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));

    try {
      if (user) {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/cart/remove/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.cart) {
            setCart(data.cart);
            localStorage.setItem('cart', JSON.stringify(data.cart.items || []));
          }
        } else {
          console.error('Failed to remove item:', response.status);
          setError('Failed to remove item');
        }
      } else {
        // Remove from guest cart
        const updatedItems = cart.items.filter(item => item.product._id !== productId);
        const updatedCart = {
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;

    try {
      if (user) {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/cart/clear', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.cart) {
            setCart(data.cart);
            localStorage.setItem('cart', JSON.stringify([]));
          }
        } else {
          console.error('Failed to clear cart:', response.status);
          setError('Failed to clear cart');
        }
      } else {
        setCart({ items: [], totalItems: 0, totalAmount: 0 });
        localStorage.setItem('cart', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart');
    }
  };

  const refreshCart = () => {
    setError('');
    setLoading(true);
    if (user) {
      fetchCart();
    } else {
      loadGuestCart();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Continue Shopping</span>
            </button>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              {cart.totalItems > 0 && (
                <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-sm">
                  {cart.totalItems} items
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
            <button 
              onClick={refreshCart}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
  
       

        {!cart.items || cart.items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <button 
              onClick={() => window.location.href = '/welcome'}
              className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Cart Items ({cart.items.length})
                      {user && <span className="text-sm font-normal text-gray-500 ml-2">(Synced)</span>}
                      {!user && <span className="text-sm font-normal text-gray-500 ml-2">(Local)</span>}
                    </h2>
                    {cart.items.length > 0 && (
                      <button 
                        onClick={clearCart}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => {
                    // Handle both database format and localStorage format
                    const product = item.product || item;
                    const itemId = product._id || product.id;
                    const productName = product.name || 'Unknown Product';
                    const productImage = product.images?.[0] || 'https://via.placeholder.com/100x100';
                    const productPrice = item.price || product.price || 0;
                    const itemQuantity = item.quantity || 1;

                    return (
                      <div key={itemId} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-4">
                          {/* Product Image */}
                          <img 
                            src={productImage}
                            alt={productName}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                            }}
                          />

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {productName}
                            </h3>
                            
                            {/* Supplier Info */}
                            {product.supplier && (
                              <p className="text-sm text-gray-500 mb-2">
                                Sold by {product.supplier.firstName} {product.supplier.lastName}
                                {product.supplier.profile?.company && 
                                  ` (${product.supplier.profile.company})`
                                }
                              </p>
                            )}

                            {/* Category */}
                            {product.category && (
                              <p className="text-xs text-gray-500 mb-3">
                                Category: {product.category}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {/* Quantity Controls */}
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                  <button 
                                    onClick={() => updateQuantity(itemId, Math.max(0, itemQuantity - 1))}
                                    disabled={updating[itemId] || itemQuantity <= 1}
                                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                                    {updating[itemId] ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mx-auto"></div>
                                    ) : (
                                      itemQuantity
                                    )}
                                  </span>
                                  <button 
                                    onClick={() => updateQuantity(itemId, itemQuantity + 1)}
                                    disabled={updating[itemId]}
                                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Remove Button */}
                                <button 
                                  onClick={() => removeItem(itemId)}
                                  disabled={updating[itemId]}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                <div className="text-lg font-bold text-orange-600">
                                  ${(productPrice * itemQuantity).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ${productPrice.toFixed(2)} each
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cart.totalItems} items)</span>
                    <span className="font-medium">${cart.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-bold text-orange-600">
                        ${cart.totalAmount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => window.location.href = user ? '/checkout' : '/login?redirect=/checkout'}
                  disabled={!cart.items || cart.items.length === 0}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{user ? 'Proceed to Checkout' : 'Sign In to Checkout'}</span>
                </button>

                {!user && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Sign in to save your cart and proceed with checkout
                  </p>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Secure Shopping</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span>🛡️</span>
                      <span>SSL encrypted checkout</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📦</span>
                      <span>Free shipping worldwide</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>↩️</span>
                      <span>30-day return policy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;