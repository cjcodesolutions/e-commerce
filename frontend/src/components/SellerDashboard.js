import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Package, 
  Eye, 
  Edit3, 
  Trash2, 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle,
  Search,
  Filter,
  MoreVertical,
  Star,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart
} from 'lucide-react';

// Move ProductForm outside the main component to prevent re-creation
const ProductForm = ({ 
  productForm, 
  setProductForm, 
  editingProduct, 
  loading, 
  imageUploading, 
  onSubmit, 
  onClose, 
  onImageUpload 
}) => {
  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Automotive', 
    'Beauty', 'Books', 'Toys', 'Health', 'Industrial'
  ];

  const units = ['piece', 'kg', 'gram', 'liter', 'meter', 'set', 'box', 'dozen'];

  const addSpecification = () => {
    setProductForm(prev => ({
      ...prev,
      specifications: [...prev.specifications, { name: '', value: '' }]
    }));
  };

  const updateSpecification = (index, field, value) => {
    setProductForm(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }));
  };

  const removeSpecification = (index) => {
    setProductForm(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={productForm.name}
                onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={productForm.description}
              onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Describe your product..."
            />
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Order Quantity *
              </label>
              <input
                type="number"
                required
                value={productForm.minOrderQuantity}
                onChange={(e) => setProductForm(prev => ({ ...prev, minOrderQuantity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select
                required
                value={productForm.unit}
                onChange={(e) => setProductForm(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select Unit</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand and Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                value={productForm.brand}
                onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                value={productForm.model}
                onChange={(e) => setProductForm(prev => ({ ...prev, model: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Model number"
              />
            </div>
          </div>

          {/* Stock and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Available quantity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={productForm.status}
                onChange={(e) => setProductForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Specifications
              </label>
              <button
                type="button"
                onClick={addSpecification}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                + Add Specification
              </button>
            </div>
            
            {productForm.specifications.map((spec, index) => (
              <div key={index} className="flex gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Specification name"
                  value={spec.name}
                  onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Product Images
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => onImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
                disabled={imageUploading}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {imageUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <span className="mt-2 text-sm text-gray-500">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload images or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG, JPEG up to 10MB each
                    </span>
                  </div>
                )}
              </label>
            </div>

            {/* Image Preview */}
            {productForm.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {productForm.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProductForm(prev => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index)
                        }));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || imageUploading}
              className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SellerDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    minOrderQuantity: '',
    unit: '',
    brand: '',
    model: '',
    specifications: [],
    features: [],
    images: [],
    stock: '',
    status: 'active',
    tags: []
  });

  const [imageUploading, setImageUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/products/seller/my-products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        console.error('Failed to fetch products:', response.status);
        setMessage({ type: 'error', text: 'Failed to fetch products' });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Failed to fetch products' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files) => {
    console.log('=== IMAGE UPLOAD STARTED ===');
    console.log('Files received:', files);
    console.log('Number of files:', files?.length);
    
    if (!files || files.length === 0) {
      console.log('No files provided');
      return;
    }

    setImageUploading(true);
    const uploadedImages = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading file ${i + 1}:`, file.name, file.size, file.type);
        
        const formData = new FormData();
        formData.append('image', file);

        console.log('FormData created, sending request...');

        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);

        const response = await fetch('http://localhost:5000/api/upload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: formData
        });

        console.log('Upload response status:', response.status);
        console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          console.log('Upload response data:', data);
          uploadedImages.push(data.imageUrl);
        } else {
          const errorText = await response.text();
          console.error('Upload failed:', errorText);
          throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
        }
      }

      console.log('All uploads completed:', uploadedImages);

      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));

      setMessage({ type: 'success', text: `${uploadedImages.length} image(s) uploaded successfully` });
    } catch (error) {
      console.error('Image upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload images: ' + error.message });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('=== SUBMITTING PRODUCT ===');
      console.log('Product form data:', productForm);

      // Frontend validation
      if (!productForm.name || !productForm.description || !productForm.category || 
          !productForm.price || !productForm.unit || !productForm.minOrderQuantity) {
        setMessage({ type: 'error', text: 'Please fill in all required fields' });
        setLoading(false);
        return;
      }

      if (productForm.images.length === 0) {
        setMessage({ type: 'error', text: 'Please upload at least one product image' });
        setLoading(false);
        return;
      }

      // Prepare data with proper types
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price) || 0,
        minOrderQuantity: parseInt(productForm.minOrderQuantity) || 1,
        stock: productForm.stock ? parseInt(productForm.stock) : 0,
        specifications: productForm.specifications.filter(spec => spec.name && spec.value)
      };

      console.log('Processed product data:', productData);

      const token = localStorage.getItem('token');
      const url = editingProduct 
        ? `http://localhost:5000/api/products/${editingProduct._id}`
        : 'http://localhost:5000/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(productData)
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: editingProduct ? 'Product updated successfully!' : 'Product created successfully!' 
        });
        setShowAddProduct(false);
        setEditingProduct(null);
        resetProductForm();
        fetchProducts(); // Refresh the product list
      } else {
        console.error('Server returned error:', data);
        setMessage({ type: 'error', text: data.message || 'Failed to save product' });
      }
    } catch (error) {
      console.error('Product submission error:', error);
      setMessage({ type: 'error', text: 'Failed to save product: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      category: '',
      subcategory: '',
      price: '',
      minOrderQuantity: '',
      unit: '',
      brand: '',
      model: '',
      specifications: [],
      features: [],
      images: [],
      stock: '',
      status: 'active',
      tags: []
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      ...product,
      specifications: product.specifications || [],
      features: product.features || [],
      tags: product.tags || []
    });
    setShowAddProduct(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Product deleted successfully' });
        fetchProducts(); // Refresh the product list
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete product' });
      }
    } catch (error) {
      console.error('Delete product error:', error);
      setMessage({ type: 'error', text: 'Failed to delete product: ' + error.message });
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || product.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, filterStatus]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFilterChange = useCallback((e) => {
    setFilterStatus(e.target.value);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowAddProduct(false);
    setEditingProduct(null);
    resetProductForm();
  }, []);

  const DashboardStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Listings</p>
            <p className="text-2xl font-bold text-gray-900">
              {products.filter(p => p.status === 'active').length}
            </p>
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Views</p>
            <p className="text-2xl font-bold text-gray-900">1,234</p>
          </div>
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Eye className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Inquiries</p>
            <p className="text-2xl font-bold text-gray-900">56</p>
          </div>
          <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName || 'User'}!</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
              { id: 'products', name: 'Products', icon: Package },
              { id: 'orders', name: 'Orders', icon: ShoppingCart },
              { id: 'analytics', name: 'Analytics', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className={`p-4 rounded-md flex items-center border ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <span className="text-sm flex-grow">{message.text}</span>
            <button
              onClick={() => setMessage({ type: '', text: '' })}
              className="ml-4 hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div>
            <DashboardStats />
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <p className="text-gray-600">No recent activity to display.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            {/* Products Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-64"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddProduct(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first product'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Add Your First Product
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200">
                    <div className="relative">
                      <img 
                        src={product.images?.[0] || 'https://via.placeholder.com/300x200'}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'inactive'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 truncate">{product.name}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-orange-600">
                          ${product.price}
                        </span>
                        <span className="text-sm text-gray-500">
                          Stock: {product.stock || 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders Management</h3>
            <p className="text-gray-600">Order management functionality will be implemented soon.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">Analytics and reporting features will be implemented soon.</p>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showAddProduct && (
        <ProductForm 
          productForm={productForm}
          setProductForm={setProductForm}
          editingProduct={editingProduct}
          loading={loading}
          imageUploading={imageUploading}
          onSubmit={handleSubmitProduct}
          onClose={handleCloseForm}
          onImageUpload={handleImageUpload}
        />
      )}
    </div>
  );
};

export default SellerDashboard;