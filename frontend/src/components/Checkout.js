// components/Checkout.js - Fixed Version
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle, AlertCircle, Lock } from 'lucide-react';

const Checkout = () => {
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: 0 });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  });

  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      window.location.href = '/login?redirect=/checkout';
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Pre-fill user information
      setShippingAddress(prev => ({
        ...prev,
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        phone: parsedUser.profile?.phone || ''
      }));

      fetchCart();
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/login';
    }
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart', {
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
          
          // If cart is empty, redirect to cart page
          if (!data.cart.items || data.cart.items.length === 0) {
            window.location.href = '/cart';
          }
        }
      } else {
        setError('Failed to load cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const clearCartAfterOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handleInputChange = (section, field, value) => {
    switch (section) {
      case 'shipping':
        setShippingAddress(prev => ({ ...prev, [field]: value }));
        break;
      case 'billing':
        setBillingAddress(prev => ({ ...prev, [field]: value }));
        break;
      case 'payment':
        setPaymentInfo(prev => ({ ...prev, [field]: value }));
        break;
      default:
        break;
    }
  };

  const validateForm = () => {
    const requiredShippingFields = ['firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'];
    
    // Check shipping address
    for (const field of requiredShippingFields) {
      if (!shippingAddress[field]) {
        setError(`Please fill in shipping ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Check billing address if different from shipping
    if (!sameAsShipping) {
      for (const field of requiredShippingFields) {
        if (!billingAddress[field]) {
          setError(`Please fill in billing ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return false;
        }
      }
    }

    // Check payment information
    if (!paymentInfo.cardNumber || paymentInfo.cardNumber.replace(/\s/g, '').length < 13) {
      setError('Please enter a valid card number');
      return false;
    }

    if (!paymentInfo.expiryDate) {
      setError('Please enter card expiry date');
      return false;
    }

    if (!paymentInfo.cvv || paymentInfo.cvv.length < 3) {
      setError('Please enter a valid CVV');
      return false;
    }

    if (!paymentInfo.cardName) {
      setError('Please enter cardholder name');
      return false;
    }

    return true;
  };

  const placeOrder = async () => {
    if (!validateForm()) return;

    setPlacing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Prepare order data
      const orderData = {
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod: paymentInfo.paymentMethod,
        paymentDetails: {
          cardLast4: paymentInfo.cardNumber.replace(/\s/g, '').slice(-4),
          cardBrand: detectCardBrand(paymentInfo.cardNumber),
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        notes,
        sameAsShipping
      };

      console.log('Placing order with data:', orderData);

      const response = await fetch('http://localhost:5000/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      console.log('Order response:', data);

      if (response.ok && data.success) {
        // Store order data for success page
        localStorage.setItem('lastOrderData', JSON.stringify(data.order));
        
        // Clear cart
        await clearCartAfterOrder();
        
        // Navigate to success page
        window.location.href = '/order-success';
        
        console.log('Order placed successfully:', data.orderNumber);
      } else {
        throw new Error(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Place order error:', error);
      setError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const detectCardBrand = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    const firstDigit = cleanNumber.charAt(0);
    const firstTwoDigits = cleanNumber.substring(0, 2);
    const firstFourDigits = cleanNumber.substring(0, 4);

    if (firstDigit === '4') return 'Visa';
    if (['51', '52', '53', '54', '55'].includes(firstTwoDigits) || 
        (parseInt(firstFourDigits) >= 2221 && parseInt(firstFourDigits) <= 2720)) return 'Mastercard';
    if (['34', '37'].includes(firstTwoDigits)) return 'Amex';
    if (firstTwoDigits === '60') return 'Discover';
    return 'Unknown';
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  const calculateTotals = () => {
    const subtotal = cart.totalAmount || 0;
    const shipping = 0; // Free shipping
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

//   const placeOrder = async () => {
//   if (!validateForm()) return;

//   setPlacing(true);
//   setError('');

//   try {
//     // Simulate loading time
//     await new Promise(resolve => setTimeout(resolve, 1500));

//     // Create mock order data
//     const mockOrderData = {
//       orderNumber: `TH${Date.now()}${Math.floor(Math.random() * 1000)}`,
//       totalAmount: parseFloat(calculateTotals().total),
//       createdAt: new Date().toISOString(),
//       orderStatus: 'pending'
//     };

//     // Store order data for success page
//     localStorage.setItem('lastOrderData', JSON.stringify(mockOrderData));
    
//     // Clear cart (optional - you can remove this if you want to keep the cart)
//     // await clearCartAfterOrder();
    
//     // Navigate to success page
//     window.location.href = '/order-success';
    
//     console.log('Navigating to success page with order:', mockOrderData.orderNumber);

//   } catch (error) {
//     console.error('Navigation error:', error);
//     setError('Something went wrong. Please try again.');
//   } finally {
//     setPlacing(false);
//   }
// };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = '/cart'}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Cart</span>
            </button>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
              <Lock className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-orange-500" />
                Shipping Address
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.firstName}
                    onChange={(e) => handleInputChange('shipping', 'firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.lastName}
                    onChange={(e) => handleInputChange('shipping', 'lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    value={shippingAddress.address}
                    onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => handleInputChange('shipping', 'state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                  <input
                    type="text"
                    value={shippingAddress.zipCode}
                    onChange={(e) => handleInputChange('shipping', 'zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <select
                    value={shippingAddress.country}
                    onChange={(e) => handleInputChange('shipping', 'country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => handleInputChange('shipping', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
              
              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Same as shipping address</span>
                </label>
              </div>

              {!sameAsShipping && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={billingAddress.firstName}
                      onChange={(e) => handleInputChange('billing', 'firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={billingAddress.lastName}
                      onChange={(e) => handleInputChange('billing', 'lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input
                      type="text"
                      value={billingAddress.address}
                      onChange={(e) => handleInputChange('billing', 'address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={billingAddress.city}
                      onChange={(e) => handleInputChange('billing', 'city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={billingAddress.state}
                      onChange={(e) => handleInputChange('billing', 'state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                    <input
                      type="text"
                      value={billingAddress.zipCode}
                      onChange={(e) => handleInputChange('billing', 'zipCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={billingAddress.phone}
                      onChange={(e) => handleInputChange('billing', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-orange-500" />
                Payment Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentInfo.paymentMethod}
                    onChange={(e) => handleInputChange('payment', 'paymentMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                {(paymentInfo.paymentMethod === 'credit_card' || paymentInfo.paymentMethod === 'debit_card') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                      <input
                        type="text"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => handleInputChange('payment', 'cardNumber', formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                        <input
                          type="text"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => handleInputChange('payment', 'expiryDate', formatExpiryDate(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                        <input
                          type="text"
                          value={paymentInfo.cvv}
                          onChange={(e) => handleInputChange('payment', 'cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name *</label>
                      <input
                        type="text"
                        value={paymentInfo.cardName}
                        onChange={(e) => handleInputChange('payment', 'cardName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Notes (Optional)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for your order..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.items?.map((item) => (
                  <div key={item.product._id} className="flex items-center space-x-3 p-2 border border-gray-100 rounded">
                    <img 
                      src={item.product.images?.[0] || 'https://via.placeholder.com/50x50'}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-orange-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="space-y-2 mb-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${totals.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>${totals.tax}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-orange-600">${totals.total}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button 
                onClick={placeOrder}
                disabled={placing}
                className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                {placing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Place Order</span>
                </>
              )}
              </button>

              {/* Security Notice */}
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;