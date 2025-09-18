// backend/routes/uploadRoutes.js
const express = require('express');
const {
  uploadImage,
  uploadImages,
  testUpload,
  handleUploadError
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Test route (no auth needed for testing)
router.get('/test', testUpload);

// All other upload routes require authentication
router.use(protect);

// Upload routes
router.post('/image', uploadImage);
router.post('/images', uploadImages);

// Error handling middleware
router.use(handleUploadError);

module.exports = router;