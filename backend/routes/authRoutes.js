const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfile, updateAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.any(), updateAvatar);

module.exports = router;
