import React, { useState, useEffect } from 'react';
import { Star, Heart, ShoppingCart, Truck, Shield, MessageCircle, ArrowLeft, Plus, Minus } from 'lucide-react';

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    // Get product ID from URL
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    if (id) {
      fetchProduct(id);
    }
  }, []);

  const fetchProduct = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.product);
      } else {
        console.error('Product not found');
        window.location.href = '/products';
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      window.location.href = '/products';
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.id) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    // Get existing cart or create new one
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingItemIndex = existingCart.findIndex(item => item.productId === product._id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      const cartItem = {
        productId: product._id,
        name: product.name,
        price: product.pricing.basePrice,
        image: product.images?.[0]?.url || '',
        category: product.category,
        supplierName: `${product.supplier.firstName} ${product.supplier.lastName}`,
        quantity: quantity,
        selectedAttributes: {}
      };
      existingCart.push(cartItem);
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Show success message
    alert(`${product.name} added to cart!`);
  };

  const handleContactSupplier = () => {
    // Implement contact supplier functionality
    alert(`Contact ${product.supplier.firstName} ${product.supplier.lastName} for more information about ${product.name}`);
  };

  const navigateBack = () => {
    window.location.href = '/products';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <button
            onClick={navigateBack}
            className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={navigateBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Products</span>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="mb-4">
              <img
                src={product.images?.[selectedImage]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop'}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-orange-500' : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.ratings.average)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">
                  {product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)
                </span>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-4xl font-bold text-orange-500 mb-2">
                ${product.pricing.basePrice}
              </div>
              <div className="text-sm text-gray-600">
                Minimum Order: {product.pricing.minOrderQuantity} units
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">
                  ({product.inventory.quantity} available)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
              <button
                onClick={handleContactSupplier}
                className="flex-1 border border-orange-500 text-orange-500 py-3 px-6 rounded-lg hover:bg-orange-50 flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Supplier
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-sm font-medium">Trade Assurance</div>
                <div className="text-xs text-gray-500">Protected order</div>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-sm font-medium">Fast Shipping</div>
                <div className="text-xs text-gray-500">7-15 days delivery</div>
              </div>
              <div className="text-center">
                <MessageCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-sm font-medium">24/7 Support</div>
                <div className="text-xs text-gray-500">Customer service</div>
              </div>
            </div>

            {/* Supplier Info */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Supplier Information</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {product.supplier.firstName} {product.supplier.lastName}
                  </div>
                  {product.supplier.company && (
                    <div className="text-sm text-gray-600">{product.supplier.company}</div>
                  )}
                  <div className="text-sm text-gray-500">
                    Verified Supplier • Member since 2020
                  </div>
                </div>
                <button
                  onClick={handleContactSupplier}
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {['description', 'specifications', 'shipping', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                
                {product.attributes && Object.keys(product.attributes).length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Product Attributes</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(product.attributes).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b">
                          <span className="font-medium capitalize">{key}:</span>
                          <span className="text-gray-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">General</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span>{product.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subcategory:</span>
                        <span>{product.subcategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weight:</span>
                        <span>{product.shipping?.weight || 'N/A'} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dimensions:</span>
                        <span>
                          {product.shipping?.dimensions ? 
                            `${product.shipping.dimensions.length}×${product.shipping.dimensions.width}×${product.shipping.dimensions.height} ${product.shipping.dimensions.unit}` : 
                            'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Pricing</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Price:</span>
                        <span>${product.pricing.basePrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Currency:</span>
                        <span>{product.pricing.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Order:</span>
                        <span>{product.pricing.minOrderQuantity} units</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <span>Free Shipping:</span>
                    <span className={product.shipping?.freeShipping ? 'text-green-600' : 'text-red-600'}>
                      {product.shipping?.freeShipping ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <span>Estimated Delivery:</span>
                    <span>
                      {product.shipping?.estimatedDelivery ? 
                        `${product.shipping.estimatedDelivery.min}-${product.shipping.estimatedDelivery.max} days` : 
                        '7-15 days'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <span>Ships From:</span>
                    <span>{product.inventory?.location?.country || 'Various Locations'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No reviews yet. Be the first to review this product!</p>
                  <button className="mt-4 bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600">
                    Write a Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;