const express = require('express');
const router = express.Router();
const { getAllUsers, getAllSellers, getSettings, updateSettings, addCategory, deleteCategory } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.get('/settings', getSettings);

// All routes below require Admin role
router.use(protect);
router.use(isAdmin);

router.get('/users', getAllUsers);
router.get('/sellers', getAllSellers);
router.post('/settings/upload', upload.single('image'), updateSettings);

// Category Management
router.post('/categories', addCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
