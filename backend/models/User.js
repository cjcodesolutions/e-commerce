// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  userType: {
    type: String,
    enum: {
      values: ['buyer', 'supplier'],
      message: 'User type must be either buyer or supplier'
    },
    default: 'buyer',
    required: [true, 'User type is required']
  },
  profile: {
    avatar: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      default: null,
      validate: {
        validator: function(v) {
          // Allow null/empty or valid phone format
          return v === null || v === '' || /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
        },
        message: 'Please enter a valid phone number'
      }
    },
    company: {
      type: String,
      default: null,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    website: {
      type: String,
      default: null,
      validate: {
        validator: function(v) {
          // Allow null/empty or valid URL
          return v === null || v === '' || /^https?:\/\/.+/.test(v);
        },
        message: 'Please enter a valid website URL'
      }
    },
    address: {
      street: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      zipCode: { type: String, default: null },
      country: { type: String, default: null }
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: null
    }
  },
  // Supplier-specific fields
  supplierInfo: {
    businessLicense: {
      type: String,
      default: null
    },
    taxId: {
      type: String,
      default: null
    },
    businessType: {
      type: String,
      enum: ['individual', 'corporation', 'partnership', 'llc', 'other'],
      default: null
    },
    yearsInBusiness: {
      type: Number,
      min: 0,
      default: null
    },
    specialties: [{
      type: String,
      trim: true
    }],
    certifications: [{
      name: String,
      issuedBy: String,
      validUntil: Date
    }],
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      count: {
        type: Number,
        min: 0,
        default: 0
      }
    }
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko'],
      default: 'en'
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'],
      default: 'USD'
    },
    categories: [{
      type: String,
      trim: true
    }]
  },
  verification: {
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: null
    },
    emailVerificationExpires: {
      type: Date,
      default: null
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    phoneVerificationCode: {
      type: String,
      default: null
    },
    phoneVerificationExpires: {
      type: Date,
      default: null
    },
    isBusinessVerified: {
      type: Boolean,
      default: false
    },
    businessVerificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'not_applicable'],
      default: 'not_applicable'
    }
  },
  resetPassword: {
    token: {
      type: String,
      default: null
    },
    expires: {
      type: Date,
      default: null
    }
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'suspended', 'pending'],
      message: 'Status must be active, inactive, suspended, or pending'
    },
    default: 'active'
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  deviceInfo: {
    type: String,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'verification.isEmailVerified': 1 });
userSchema.index({ 'verification.isBusinessVerified': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to set business verification status for suppliers
userSchema.pre('save', function(next) {
  if (this.userType === 'supplier' && this.verification.businessVerificationStatus === 'not_applicable') {
    this.verification.businessVerificationStatus = 'pending';
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Instance method to generate full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Instance method to check if user can perform supplier actions
userSchema.methods.canPerformSupplierActions = function() {
  return this.userType === 'supplier' && 
         this.status === 'active' && 
         this.verification.isEmailVerified;
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Static method to find verified suppliers
userSchema.statics.findVerifiedSuppliers = function() {
  return this.find({
    userType: 'supplier',
    status: 'active',
    'verification.isEmailVerified': true,
    'verification.businessVerificationStatus': 'approved'
  });
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  let completed = 0;
  let total = 8;
  
  if (this.firstName) completed++;
  if (this.lastName) completed++;
  if (this.email) completed++;
  if (this.profile.phone) completed++;
  if (this.profile.company) completed++;
  if (this.profile.address.country) completed++;
  if (this.profile.bio) completed++;
  if (this.verification.isEmailVerified) completed++;
  
  return Math.round((completed / total) * 100);
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Remove sensitive fields from JSON output
    delete ret.password;
    delete ret.__v;
    delete ret.resetPassword;
    delete ret.verification.emailVerificationToken;
    delete ret.verification.phoneVerificationCode;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    delete ret.ipAddress;
    delete ret.deviceInfo;
    
    // Only include supplier info for suppliers
    if (ret.userType !== 'supplier') {
      delete ret.supplierInfo;
    }
    
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);