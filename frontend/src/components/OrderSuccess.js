// components/OrderSuccess.js
import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, Truck, Home, Star, Download, Share2 } from 'lucide-react';

const OrderSuccess = () => {
  const [orderData, setOrderData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get order data from localStorage or URL params
    const storedOrderData = localStorage.getItem('lastOrderData');
    const userData = localStorage.getItem('user');
    
    if (storedOrderData) {
      setOrderData(JSON.parse(storedOrderData));
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Clear the stored order data after displaying
    setTimeout(() => {
      localStorage.removeItem('lastOrderData');
    }, 5000);
  }, []);

  const navigateToOrders = () => {
    window.location.href = '/orders';
  };

  const navigateToHome = () => {
    window.location.href = user?.userType === 'supplier' ? '/seller-dashboard' : '/welcome';
  };

  const shareOrder = () => {
    if (navigator.share && orderData) {
      navigator.share({
        title: 'TradeHub Order Confirmation',
        text: `My order ${orderData.orderNumber} has been placed successfully!`,
        url: window.location.origin
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`Order ${orderData?.orderNumber} placed successfully on TradeHub!`);
    }
  };

  const downloadReceipt = () => {
    // Simple receipt download functionality
    const receiptContent = `
TRADEHUB ORDER RECEIPT
====================
Order Number: ${orderData?.orderNumber}
Date: ${new Date(orderData?.createdAt || Date.now()).toLocaleDateString()}
Customer: ${user?.firstName} ${user?.lastName}
Total Amount: $${orderData?.totalAmount?.toFixed(2)}

Thank you for your order!
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TradeHub_Receipt_${orderData?.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const estimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
    return deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Main Success Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-500 to-orange-500"></div>
            
            {/* Success Animation */}
            <div className="relative mb-8">
              <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              
              {/* Confetti Animation */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full animate-ping"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              🎉 You're Done!
            </h1>
            
            <p className="text-xl text-gray-600 mb-2">
              Your order has been placed successfully!
            </p>

            {orderData && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-lg font-semibold text-orange-800">
                  Order Number: <span className="font-mono">{orderData.orderNumber}</span>
                </p>
                <p className="text-orange-700">
                  Total Amount: <span className="font-bold">${orderData.totalAmount?.toFixed(2)}</span>
                </p>
              </div>
            )}

            {/* Order Status Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-green-800">Order Confirmed</p>
                    <p className="text-sm text-green-600">Your order has been received and confirmed</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-yellow-800">Processing</p>
                    <p className="text-sm text-yellow-600">Supplier is preparing your order</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-blue-800">Shipped</p>
                    <p className="text-sm text-blue-600">Estimated delivery: {estimatedDelivery()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={navigateToOrders}
                  className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Package className="w-5 h-5" />
                  <span>Track Your Order</span>
                </button>
                
                <button 
                  onClick={navigateToHome}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Home className="w-5 h-5" />
                  <span>Continue Shopping</span>
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={downloadReceipt}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Receipt</span>
                </button>
                
                <button 
                  onClick={shareOrder}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <p className="text-purple-800 font-medium">
                Thank you for choosing TradeHub! 💜
              </p>
              <p className="text-sm text-purple-600 mt-1">
                We'll send you email updates about your order status
              </p>
            </div>

            {/* Customer Support */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Need help? Contact our{' '}
                <button className="text-orange-600 hover:text-orange-700 font-medium">
                  customer support
                </button>
              </p>
            </div>
          </div>

          {/* Rate Your Experience */}
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Rate Your Experience
            </h3>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="text-2xl text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Your feedback helps us improve our service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;