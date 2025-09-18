// backend/routes/userRoutes.js
const express = require('express');
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getUsers
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.delete('/delete-account', deleteAccount);

// Admin only routes
router.get('/', authorize('admin'), getUsers);

module.exports = router;