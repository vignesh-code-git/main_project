const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../config/multer');
const { protect, isSeller } = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/top-selling', productController.getTopSelling);
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);
router.get('/stats', productController.getStats);
router.get('/:id', productController.getProductById);

// Protected routes
router.post('/', protect, isSeller, upload.array('files', 10), productController.createProduct);
router.post('/bulk', protect, isSeller, upload.single('file'), productController.bulkUploadProducts);

module.exports = router;
