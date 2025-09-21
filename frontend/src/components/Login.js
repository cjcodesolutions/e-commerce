import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear any existing messages when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Client-side validation
    if (!formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Please provide both email and password' });
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      setIsLoading(false);
      return;
    }

    try {
      console.log('Sending login request...');
      console.log('API URL:', 'http://localhost:5000/api/auth/login');
      console.log('Request data:', { email: formData.email, password: '[HIDDEN]' });
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: data.message || 'Login successful! Welcome back.' 
        });
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        // Clear form
        setFormData({
          email: '',
          password: ''
        });

        // Role-based redirection
        const redirectPath = data.user.userType === 'supplier' ? '/seller-dashboard' : '/welcome';
        
        // Redirect based on user type after 1.5 seconds
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 1500);

      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'Login failed. Please check your credentials.' 
        });
      }

    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        setMessage({ 
          type: 'error', 
          text: 'Unable to connect to server. Please ensure the backend is running on http://localhost:5000' 
        });
      } else if (error.message.includes('CORS') || error.message.includes('Access-Control')) {
        setMessage({ 
          type: 'error', 
          text: 'CORS error. Please check your backend CORS configuration.' 
        });
      } else if (error.message.includes('HTTP 404')) {
        setMessage({ 
          type: 'error', 
          text: 'Login endpoint not found. Please check your backend routes.' 
        });
      } else if (error.message.includes('HTTP 500')) {
        setMessage({ 
          type: 'error', 
          text: 'Server error. Please check the backend logs.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: error.message || 'An unexpected error occurred. Please try again.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setMessage({ 
      type: 'info', 
      text: 'Forgot password functionality will be implemented soon.' 
    });
  };

  const fillDemoCredentials = (type) => {
    setMessage({ type: '', text: '' });
    
    if (type === 'buyer') {
      setFormData({
        email: 'buyer@example.com',
        password: 'password123'
      });
    } else if (type === 'seller') {
      setFormData({
        email: 'seller@example.com',
        password: 'password123'
      });
    } else if (type === 'your') {
      setFormData({
        email: 'cjcodesolutions@gmail.com',
        password: 'tharu**@'
      });
    }
  };

  const testBackendConnection = async () => {
    try {
      setMessage({ type: 'info', text: 'Testing backend connection...' });
      
      const response = await fetch('http://localhost:5000/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ 
          type: 'success', 
          text: `Backend is running! Server time: ${new Date(data.timestamp).toLocaleTimeString()}` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Backend is not responding properly.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Cannot connect to backend. Make sure it\'s running on http://localhost:5000' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your TradeHub account
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* Alert Messages */}
          {message.text && (
            <div className={`mb-4 p-4 rounded-md flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : message.type === 'info'
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-medium text-orange-600 hover:text-orange-500"
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
                }`}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>

            {/* Test Backend Button */}
            

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => window.location.href = '/signup'}
                  className="font-medium text-orange-600 hover:text-orange-500"
                  disabled={isLoading}
                >
                  Sign up for free
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Additional Options
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled={isLoading}
            >
              <span>Google</span>
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled={isLoading}
            >
              <span>LinkedIn</span>
            </button>
          </div>
        </div> */}

        {/* Demo Credentials */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-3">Demo Credentials</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-blue-800">Buyer Account:</p>
                <p className="text-xs text-blue-700">buyer@example.com | password123</p>
              </div>
              <button
                onClick={() => fillDemoCredentials('buyer')}
                className="text-xs bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded transition-colors"
                disabled={isLoading}
              >
                Use
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-blue-800">Seller Account:</p>
                <p className="text-xs text-blue-700">seller@example.com | password123</p>
              </div>
              <button
                onClick={() => fillDemoCredentials('seller')}
                className="text-xs bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded transition-colors"
                disabled={isLoading}
              >
                Use
              </button>
            </div>
             */}
            <div className="flex justify-between items-center">
              {/* <div>
                <p className="text-xs font-medium text-blue-800">Your Account:</p>
                <p className="text-xs text-blue-700">cjcodesolutions@gmail.com | tharu**@</p>
              </div>
              <button
                onClick={() => fillDemoCredentials('your')}
                className="text-xs bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded transition-colors"
                disabled={isLoading}
              >
                Use
              </button> */}
            </div>
          </div>
        </div>
     
  );
};

export default Login;