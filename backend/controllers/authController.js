// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Send response with token
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Determine redirect path based on user type
  const redirectPath = user.userType === 'supplier' ? '/seller-welcome' : '/welcome';

  res.status(statusCode)
     .cookie('token', token, options)
     .json({
       success: true,
       message,
       token,
       redirectPath, // Include redirect path in response
       user: {
         id: user._id,
         firstName: user.firstName,
         lastName: user.lastName,
         email: user.email,
         userType: user.userType,
         fullName: user.fullName,
         isEmailVerified: user.verification.isEmailVerified,
         createdAt: user.createdAt
       }
     });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    console.log('=== REGISTRATION REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { firstName, lastName, email, password, confirmPassword, userType } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check password strength
    if (password.length < 6) {
      console.log('Validation failed: Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate userType
    if (userType && !['buyer', 'supplier'].includes(userType)) {
      console.log('Validation failed: Invalid user type');
      return res.status(400).json({
        success: false,
        message: 'User type must be either buyer or supplier'
      });
    }

    // Check if user already exists
    console.log('Checking if user exists with email:', email);
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    console.log('Creating new user...');
    // Create user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      userType: userType || 'buyer',
      verification: {
        emailVerificationToken,
        emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      }
    });

    console.log('User created successfully:', user._id);
    console.log('User type:', user.userType);

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, emailVerificationToken);

    const successMessage = userType === 'supplier' 
      ? 'Seller account created successfully! Welcome to TradeHub.' 
      : 'Buyer account created successfully! Welcome to TradeHub.';

    sendTokenResponse(user, 201, res, successMessage);

  } catch (error) {
    console.error('Registration error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.log('Mongoose validation errors:', messages);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    console.log('=== LOGIN REQUEST ===');
    console.log('Request body:', { email: req.body.email, password: '[HIDDEN]' });
    console.log('Request headers:', req.headers);
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('Validation failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field
    console.log('Looking for user with email:', email);
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('User found:', user._id);
    console.log('User type:', user.userType);

    // Check if account is active
    if (user.status !== 'active') {
      console.log('Account is not active:', user.status);
      return res.status(401).json({
        success: false,
        message: 'Account is suspended. Please contact support.'
      });
    }

    // Check password
    console.log('Checking password...');
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('Password valid. Updating last login...');
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log('Login successful for user:', user._id);
    
    const welcomeMessage = user.userType === 'supplier' 
      ? `Welcome back, ${user.firstName}! Ready to manage your products?` 
      : `Welcome back, ${user.firstName}! Ready to find great products?`;

    sendTokenResponse(user, 200, res, welcomeMessage);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        fullName: user.fullName,
        isEmailVerified: user.verification.isEmailVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      'verification.emailVerificationToken': token,
      'verification.emailVerificationExpires': { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    user.verification.isEmailVerified = true;
    user.verification.emailVerificationToken = undefined;
    user.verification.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.verification.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.verification.emailVerificationToken = emailVerificationToken;
    user.verification.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, emailVerificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending verification email'
    });
  }
};