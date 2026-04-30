const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { protect, isSeller } = require('../middleware/authMiddleware');

router.get('/stats', protect, isSeller, sellerController.getSellerStats);

module.exports = router;
