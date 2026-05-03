const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, orderController.createOrder);
router.get('/', protect, orderController.getAllOrders);
router.get('/user/:userId', protect, orderController.getUserOrders);
router.get('/seller/:sellerId', protect, orderController.getSellerOrders);
router.get('/seller/:sellerId/returns', protect, orderController.getSellerReturns);
router.get('/seller/:sellerId/feedback', protect, orderController.getSellerFeedback);
router.get('/:id', protect, orderController.getOrderById);
router.put('/:id/status', protect, orderController.updateOrderStatus);
router.put('/:id/cancel', protect, orderController.cancelOrder);
router.get('/:id/invoice', protect, orderController.generateInvoice);
router.post('/return', protect, orderController.createReturn);
router.post('/feedback', protect, orderController.createFeedback);

module.exports = router;
