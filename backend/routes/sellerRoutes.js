// routes/sellerRoutes.js - Seller routes
const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');

// Create seller
router.post('/', async (req, res) => {
  try {
    const seller = new Seller(req.body);
    const savedSeller = await seller.save();
    
    res.status(201).json({
      success: true,
      message: 'Seller created successfully',
      seller: savedSeller
    });
  } catch (error) {
    console.error('Error creating seller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create seller',
      error: error.message
    });
  }
});

// Get seller by ID
router.get('/:sellerId', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.sellerId);
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.json({
      success: true,
      seller
    });
  } catch (error) {
    console.error('Error fetching seller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller',
      error: error.message
    });
  }
});

module.exports = router;