// backend/controllers/uploadController.js - Fixed Version
const AWS = require('aws-sdk');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Configure multer for memory storage (no multer-s3)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    console.log('File filter - checking file:', file.originalname, 'Type:', file.mimetype);
    
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, JPG and WebP images are allowed.'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to upload buffer to S3
const uploadToS3 = async (buffer, fileName, mimeType) => {
  const uniqueSuffix = crypto.randomBytes(16).toString('hex');
  const fileExtension = path.extname(fileName);
  const key = `products/${Date.now()}-${uniqueSuffix}${fileExtension}`;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType
    // REMOVED ACL: 'public-read' - this was causing the AccessControlListNotSupported error
    // Your bucket must be configured to allow public access through bucket policy instead
  };

  console.log('Uploading to S3 with params:', {
    Bucket: uploadParams.Bucket,
    Key: uploadParams.Key,
    ContentType: uploadParams.ContentType
  });

  const result = await s3.upload(uploadParams).promise();
  console.log('S3 upload successful:', result.Location);
  return result.Location;
};

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    console.log('=== UPLOAD IMAGE REQUEST ===');
    console.log('User:', req.user._id);
    console.log('Content-Type:', req.get('Content-Type'));

    // Use multer middleware
    const uploadSingle = upload.single('image');
    
    uploadSingle(req, res, async function(err) {
      if (err) {
        console.error('Multer error:', err);
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.'
          });
        }
        
        return res.status(400).json({
          success: false,
          message: err.message || 'Error uploading file'
        });
      }

      if (!req.file) {
        console.log('No file received');
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      console.log('File received:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      try {
        // Upload to S3
        const imageUrl = await uploadToS3(
          req.file.buffer, 
          req.file.originalname, 
          req.file.mimetype
        );

        console.log('File uploaded successfully to S3:', imageUrl);

        res.status(200).json({
          success: true,
          message: 'Image uploaded successfully',
          imageUrl: imageUrl
        });

      } catch (s3Error) {
        console.error('S3 upload error:', s3Error);
        
        // Handle specific S3 errors
        if (s3Error.code === 'AccessControlListNotSupported') {
          return res.status(500).json({
            success: false,
            message: 'S3 bucket configuration issue. Please ensure your bucket allows public access through bucket policy instead of ACLs.',
            error: process.env.NODE_ENV === 'development' ? s3Error.message : undefined
          });
        }
        
        if (s3Error.code === 'NoSuchBucket') {
          return res.status(500).json({
            success: false,
            message: 'S3 bucket not found. Please check your AWS_S3_BUCKET environment variable.',
            error: process.env.NODE_ENV === 'development' ? s3Error.message : undefined
          });
        }
        
        if (s3Error.code === 'InvalidAccessKeyId' || s3Error.code === 'SignatureDoesNotMatch') {
          return res.status(500).json({
            success: false,
            message: 'AWS authentication failed. Please check your credentials.',
            error: process.env.NODE_ENV === 'development' ? s3Error.message : undefined
          });
        }
        
        res.status(500).json({
          success: false,
          message: 'Failed to upload to S3: ' + s3Error.message
        });
      }
    });

  } catch (error) {
    console.error('Upload controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
exports.uploadImages = async (req, res) => {
  try {
    console.log('=== UPLOAD MULTIPLE IMAGES REQUEST ===');
    console.log('User:', req.user._id);

    const uploadMultiple = upload.array('images', 10);
    
    uploadMultiple(req, res, async function(err) {
      if (err) {
        console.error('Multer error:', err);
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'One or more files are too large. Maximum size is 10MB per file.'
          });
        }
        
        return res.status(400).json({
          success: false,
          message: err.message || 'Error uploading files'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      try {
        const uploadPromises = req.files.map(file => 
          uploadToS3(file.buffer, file.originalname, file.mimetype)
        );

        const imageUrls = await Promise.all(uploadPromises);

        console.log(`${req.files.length} files uploaded successfully`);

        res.status(200).json({
          success: true,
          message: `${req.files.length} images uploaded successfully`,
          imageUrls: imageUrls
        });

      } catch (s3Error) {
        console.error('S3 upload error:', s3Error);
        res.status(500).json({
          success: false,
          message: 'Failed to upload to S3: ' + s3Error.message
        });
      }
    });

  } catch (error) {
    console.error('Upload multiple controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
};

// @desc    Test upload functionality
// @route   GET /api/upload/test
// @access  Private
exports.testUpload = async (req, res) => {
  try {
    console.log('=== TEST UPLOAD CONFIGURATION ===');
    
    const bucketParams = {
      Bucket: process.env.AWS_S3_BUCKET
    };

    await s3.headBucket(bucketParams).promise();

    res.status(200).json({
      success: true,
      message: 'Upload configuration is working correctly',
      config: {
        bucket: process.env.AWS_S3_BUCKET,
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not Set'
      }
    });

  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload configuration test failed',
      error: error.message
    });
  }
};

// Middleware to handle upload errors
exports.handleUploadError = (error, req, res, next) => {
  console.error('Upload middleware error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Too many files. Maximum is 10 files.'
    });
  }
  
  res.status(400).json({
    success: false,
    message: error.message || 'Upload error'
  });
};