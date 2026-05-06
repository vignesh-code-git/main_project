const express = require('express');
const router = express.Router();
const { 
  getAllUsers, getAllSellers, getSettings, updateSettings, 
  addCategory, deleteCategory,
  addBrand, deleteBrand,
  addStyle, deleteStyle,
  addSize, deleteSize,
  addColor, deleteColor
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.get('/settings', getSettings);

// All routes below require Admin role
router.use(protect);
router.use(isAdmin);

router.get('/users', getAllUsers);
router.get('/sellers', getAllSellers);
router.post('/settings/upload', upload.single('image'), updateSettings);

// Attribute Management
router.post('/categories', addCategory);
router.delete('/categories/:id', deleteCategory);

router.post('/brands', addBrand);
router.delete('/brands/:id', deleteBrand);

router.post('/styles', addStyle);
router.delete('/styles/:id', deleteStyle);

router.post('/sizes', addSize);
router.delete('/sizes/:id', deleteSize);

router.post('/colors', addColor);
router.delete('/colors/:id', deleteColor);

module.exports = router;
