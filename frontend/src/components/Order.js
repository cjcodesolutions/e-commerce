import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  ArrowLeft, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Star,
  MessageCircle,
  MapPin,
  Calendar,
  CreditCard,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      window.location.href = '/login';
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/login';
    }
  }, [filter, currentPage, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filter !== 'all') params.append('status', filter);
      params.append('page', currentPage);
      params.append('limit', '10');
      params.append('sort', sortBy === 'newest' ? '-createdAt' : 
                              sortBy === 'oldest' ? 'createdAt' : 
                              sortBy === 'amount_high' ? '-totalAmount' : 'totalAmount');
      
      const response = await fetch(`http://localhost:5000/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setTotalPages(data.pages || 1);
        setError('');
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusIcon = (status) => {
    const iconClasses = "w-4 h-4";
    switch (status) {
      case 'pending':
        return <Clock className={`${iconClasses} text-yellow-500`} />;
      case 'confirmed':
        return <CheckCircle className={`${iconClasses} text-blue-500`} />;
      case 'processing':
        return <Package className={`${iconClasses} text-indigo-500`} />;
      case 'shipped':
        return <Truck className={`${iconClasses} text-purple-500`} />;
      case 'delivered':
        return <CheckCircle className={`${iconClasses} text-green-500`} />;
      case 'cancelled':
        return <XCircle className={`${iconClasses} text-red-500`} />;
      case 'refunded':
        return <AlertTriangle className={`${iconClasses} text-orange-500`} />;
      default:
        return <Package className={`${iconClasses} text-gray-500`} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'pending': return 10;
      case 'confirmed': return 25;
      case 'processing': return 50;
      case 'shipped': return 75;
      case 'delivered': return 100;
      case 'cancelled':
      case 'refunded': return 0;
      default: return 0;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const viewOrderDetails = async (orderId) => {
    try {
      setActionLoading(prev => ({ ...prev, [orderId]: true }));
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data.order);
        setError('');
      } else {
        throw new Error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;

    try {
      setActionLoading(prev => ({ ...prev, [`cancel-${orderId}`]: true }));
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        fetchOrders(); // Refresh orders list
        fetchStats(); // Refresh stats
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(null);
        }
        setError('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      setError(error.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [`cancel-${orderId}`]: false }));
    }
  };

  const toggleItemExpansion = (orderId, itemIndex) => {
    const key = `${orderId}-${itemIndex}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredOrders = orders.filter(order => {
    if (searchTerm) {
      return order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
             order.items.some(item => 
               item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
             );
    }
    return true;
  });

  const downloadOrderReceipt = (order) => {
    // Create a simple receipt content
    const receiptContent = `
      Order Receipt - TradeHub
      ========================
      
      Order Number: ${order.orderNumber}
      Order Date: ${formatDate(order.createdAt)}
      Status: ${order.orderStatus}
      
      Items:
      ${order.items.map(item => 
        `- ${item.product.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`
      ).join('\n')}
      
      Subtotal: ${formatCurrency(order.subtotal)}
      Tax: ${formatCurrency(order.tax)}
      Shipping: ${formatCurrency(order.shippingCost)}
      Total: ${formatCurrency(order.totalAmount)}
      
      Shipping Address:
      ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}
      ${order.shippingAddress.address}
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
      ${order.shippingAddress.country}
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Order-${order.orderNumber}-Receipt.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/welcome'}
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Shopping</span>
              </button>
              <div className="flex items-center space-x-2">
                <Package className="w-6 h-6 text-orange-500" />
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              </div>
            </div>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {Object.keys(stats).length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelledOrders || 0}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(stats.totalSpent || stats.totalRevenue || 0)}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by order number or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">Highest Amount</option>
                <option value="amount_low">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {filteredOrders.length === 0 ? (
          /* No Orders */
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Orders Found</h2>
            <p className="text-gray-600 mb-8">
              {searchTerm ? `No orders found matching "${searchTerm}"` :
               filter === 'all' ? "You haven't placed any orders yet." :
               `No orders found with status: ${filter}`}
            </p>
            <div className="flex justify-center space-x-4">
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Clear Search
                </button>
              )}
              <button 
                onClick={() => window.location.href = '/welcome'}
                className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200">
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(order.createdAt)}</span>
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.orderStatus)}
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            order.orderStatus === 'cancelled' || order.orderStatus === 'refunded'
                              ? 'bg-red-400'
                              : 'bg-orange-500'
                          }`}
                          style={{ width: `${getProgressPercentage(order.orderStatus)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Placed</span>
                        <span>Processing</span>
                        <span>Shipped</span>
                        <span>Delivered</span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-sm text-gray-500">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} total qty
                        </span>
                      </div>
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        {order.items.slice(0, 4).map((item, index) => (
                          <div key={index} className="flex-shrink-0 relative">
                            <img
                              src={item.product.images?.[0] || 'https://via.placeholder.com/50x50'}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded border border-gray-200"
                            />
                            {item.quantity > 1 && (
                              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-gray-500">+{order.items.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Amount</span>
                        <span className="text-lg font-bold text-orange-600">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Payment: {order.paymentMethod.replace('_', ' ')}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                          order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewOrderDetails(order._id)}
                          disabled={actionLoading[order._id]}
                          className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          {actionLoading[order._id] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                          <span>Details</span>
                        </button>

                        <button
                          onClick={() => downloadOrderReceipt(order)}
                          className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Receipt</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        {['pending', 'confirmed'].includes(order.orderStatus) && (
                          <button
                            onClick={() => cancelOrder(order._id)}
                            disabled={actionLoading[`cancel-${order._id}`]}
                            className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {actionLoading[`cancel-${order._id}`] ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}

                        {order.orderStatus === 'delivered' && (
                          <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors">
                            <Star className="w-4 h-4" />
                            <span>Review</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg ${
                            currentPage === page
                              ? 'bg-orange-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Order Details Panel */}
            <div className="lg:sticky lg:top-4">
              {selectedOrder ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Order Header Info */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">#{selectedOrder.orderNumber}</h4>
                          <p className="text-sm text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            {getStatusIcon(selectedOrder.orderStatus)}
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedOrder.orderStatus)}`}>
                              {selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1)}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-orange-600">{formatCurrency(selectedOrder.totalAmount)}</p>
                        </div>
                      </div>

                      {/* Quick Info Grid */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Payment:</span>
                          <span className="font-medium capitalize">{selectedOrder.paymentMethod.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Items:</span>
                          <span className="font-medium">{selectedOrder.items.length}</span>
                        </div>
                        {selectedOrder.trackingNumber && (
                          <div className="flex items-center space-x-2 col-span-2">
                            <Truck className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Tracking:</span>
                            <span className="font-medium">{selectedOrder.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-orange-500" />
                        Items Ordered
                      </h4>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {selectedOrder.items.map((item, index) => {
                          const isExpanded = expandedItems[`${selectedOrder._id}-${index}`];
                          
                          return (
                            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="p-4">
                                <div className="flex items-start space-x-4">
                                  <img
                                    src={item.product.images?.[0] || 'https://via.placeholder.com/60x60'}
                                    alt={item.product.name}
                                    className="w-15 h-15 object-cover rounded-lg border border-gray-200"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h5 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                                          {item.product.name}
                                        </h5>
                                        <p className="text-xs text-gray-500 mb-2">
                                          Category: {item.product.category}
                                        </p>
                                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                                          <span>Qty: {item.quantity}</span>
                                          <span>Unit: {formatCurrency(item.price)}</span>
                                          <span className="font-medium">Total: {formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => toggleItemExpansion(selectedOrder._id, index)}
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                      >
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                      </button>
                                    </div>

                                    {/* Supplier Info */}
                                    {item.supplier && (
                                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                        <div className="flex items-center space-x-1">
                                          <span>Sold by:</span>
                                          <span className="font-medium">
                                            {item.supplier.firstName} {item.supplier.lastName}
                                          </span>
                                          {item.supplier.profile?.company && (
                                            <span>({item.supplier.profile.company})</span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Expanded Item Details */}
                                {isExpanded && (
                                  <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      {item.itemStatus && (
                                        <div>
                                          <span className="text-gray-500">Item Status:</span>
                                          <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getStatusColor(item.itemStatus)}`}>
                                            {item.itemStatus}
                                          </span>
                                        </div>
                                      )}
                                      {item.trackingNumber && (
                                        <div>
                                          <span className="text-gray-500">Tracking:</span>
                                          <span className="ml-1 font-mono">{item.trackingNumber}</span>
                                        </div>
                                      )}
                                      {item.shippedDate && (
                                        <div>
                                          <span className="text-gray-500">Shipped:</span>
                                          <span className="ml-1">{formatDate(item.shippedDate)}</span>
                                        </div>
                                      )}
                                      {item.deliveredDate && (
                                        <div>
                                          <span className="text-gray-500">Delivered:</span>
                                          <span className="ml-1">{formatDate(item.deliveredDate)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shipping & Billing Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                          Shipping Address
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
                          <p className="font-medium">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                          <p>{selectedOrder.shippingAddress.address}</p>
                          {selectedOrder.shippingAddress.address2 && <p>{selectedOrder.shippingAddress.address2}</p>}
                          <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                          <p>{selectedOrder.shippingAddress.country}</p>
                          <p className="pt-1 border-t border-gray-200">📞 {selectedOrder.shippingAddress.phone}</p>
                        </div>
                      </div>

                      {/* Billing Address */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <CreditCard className="w-5 h-5 mr-2 text-orange-500" />
                          Billing Address
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
                          <p className="font-medium">{selectedOrder.billingAddress.firstName} {selectedOrder.billingAddress.lastName}</p>
                          <p>{selectedOrder.billingAddress.address}</p>
                          {selectedOrder.billingAddress.address2 && <p>{selectedOrder.billingAddress.address2}</p>}
                          <p>{selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.zipCode}</p>
                          <p>{selectedOrder.billingAddress.country}</p>
                          <p className="pt-1 border-t border-gray-200">📞 {selectedOrder.billingAddress.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Timeline */}
                    {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-orange-500" />
                          Order Timeline
                        </h4>
                        <div className="space-y-3">
                          {selectedOrder.timeline.map((event, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className={`w-3 h-3 rounded-full mt-1.5 ${
                                index === 0 ? 'bg-orange-500' : 'bg-gray-300'
                              }`}></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 capitalize">{event.status}</p>
                                  <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                                </div>
                                {event.note && (
                                  <p className="text-xs text-gray-600 mt-1">{event.note}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order Notes */}
                    {selectedOrder.notes && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <MessageCircle className="w-5 h-5 mr-2 text-orange-500" />
                          Order Notes
                        </h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">{selectedOrder.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">{formatCurrency(selectedOrder.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-medium">
                            {selectedOrder.shippingCost > 0 ? formatCurrency(selectedOrder.shippingCost) : 'Free'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax</span>
                          <span className="font-medium">{formatCurrency(selectedOrder.tax)}</span>
                        </div>
                        {selectedOrder.discount && selectedOrder.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-{formatCurrency(selectedOrder.discount)}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-300 pt-2 mt-2">
                          <div className="flex justify-between text-lg font-bold">
                            <span className="text-gray-900">Total</span>
                            <span className="text-orange-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-orange-500" />
                        Payment Information
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Method:</span>
                            <span className="ml-1 font-medium capitalize">{selectedOrder.paymentMethod.replace('_', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                              selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                              selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {selectedOrder.paymentStatus}
                            </span>
                          </div>
                          {selectedOrder.paymentDetails?.cardLast4 && (
                            <div className="col-span-2">
                              <span className="text-gray-600">Card:</span>
                              <span className="ml-1 font-medium">
                                {selectedOrder.paymentDetails.cardBrand} **** {selectedOrder.paymentDetails.cardLast4}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="space-y-3">
                      {['pending', 'confirmed'].includes(selectedOrder.orderStatus) && (
                        <button
                          onClick={() => cancelOrder(selectedOrder._id)}
                          disabled={actionLoading[`cancel-${selectedOrder._id}`]}
                          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                          {actionLoading[`cancel-${selectedOrder._id}`] ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Cancelling Order...</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span>Cancel Order</span>
                            </>
                          )}
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => downloadOrderReceipt(selectedOrder)}
                          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>

                        <button
                          onClick={() => window.print()}
                          className="bg-orange-100 text-orange-700 py-2 px-4 rounded-lg hover:bg-orange-200 transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                          <Package className="w-4 h-4" />
                          <span>Print</span>
                        </button>
                      </div>

                      {selectedOrder.orderStatus === 'delivered' && (
                        <button className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center justify-center space-x-2">
                          <Star className="w-4 h-4" />
                          <span>Write Review</span>
                        </button>
                      )}

                      {selectedOrder.orderStatus === 'delivered' && (
                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2">
                          <Package className="w-4 h-4" />
                          <span>Reorder Items</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Order</h3>
                  <p className="text-gray-500 mb-4">Click on any order from the list to view detailed information</p>
                  <div className="text-sm text-gray-400">
                    <p>• View order timeline and status</p>
                    <p>• See shipping and billing details</p>
                    <p>• Download receipts and invoices</p>
                    <p>• Track your packages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;