import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, CreditCard } from 'lucide-react';

const ShoppingCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setCartItems(prev => 
      prev.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeItem = (productId) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    // Simple shipping calculation
    return cartItems.length > 0 ? 15.00 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleCheckout = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.id) {
      window.location.href = '/login';
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    window.location.href = '/checkout';
  };

  const navigateToProducts = () => {
    window.location.href = '/products';
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <button
              onClick={navigateToProducts}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 inline-flex items-center"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {cartItems.map((item, index) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  isLast={index === cartItems.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${calculateShipping().toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-orange-500">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceed to Checkout
                  </>
                )}
              </button>

              <button
                onClick={navigateToProducts}
                className="w-full mt-3 border border-orange-500 text-orange-500 py-3 px-4 rounded-lg hover:bg-orange-50 flex items-center justify-center"
              >
                Continue Shopping
              </button>

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Free shipping on orders over $100
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  30-day return policy
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Secure payment processing
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartItem = ({ item, onUpdateQuantity, onRemove, isLast }) => {
  return (
    <div className={`p-6 ${!isLast ? 'border-b border-gray-200' : ''}`}>
      <div className="flex space-x-4">
        <img
          src={item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'}
          alt={item.name}
          className="w-20 h-20 object-cover rounded-lg"
        />
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{item.category}</p>
          <p className="text-sm text-gray-500">by {item.supplierName}</p>
          
          {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
            <div className="mt-2">
              {Object.entries(item.selectedAttributes).map(([key, value]) => (
                <span key={key} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mr-2">
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={() => onRemove(item.productId)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="text-lg font-semibold text-gray-900">
            ${(item.price * item.quantity).toFixed(2)}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              className="p-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              className="p-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            ${item.price.toFixed(2)} each
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPage;