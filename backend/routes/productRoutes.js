const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../config/multer');
const { protect, isSeller } = require('../middleware/authMiddleware');
const { validateProduct } = require('../validations/productValidation');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/top-selling', productController.getTopSelling);
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);
router.get('/styles', productController.getStyles);
router.get('/sizes', productController.getSizes);
router.get('/colors', productController.getColors);
router.get('/stats', productController.getStats);
router.get('/:id', productController.getProductById);

// Protected routes
router.get('/seller/my-products', protect, isSeller, productController.getSellerProducts);
router.get('/seller/export', protect, isSeller, productController.exportProductsToCSV);
router.post('/', protect, isSeller, upload.any(), productController.createProduct);
router.post('/bulk', protect, isSeller, upload.single('file'), productController.bulkUploadProducts);

router.put('/:id', protect, isSeller, upload.any(), productController.updateProduct);
router.delete('/:id', protect, isSeller, productController.deleteProduct);

module.exports = router;
