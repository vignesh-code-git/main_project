const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfile, updateAvatar, getMe, logoutUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const upload = require('../config/multer');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.any(), updateAvatar);
router.get('/me', protect, getMe);
router.post('/logout', logoutUser);

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, generate JWT and set cookie
    const generateToken = (id, role) => {
      return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secretkey', {
        expiresIn: '30d',
      });
    };

    const token = generateToken(req.user.id, req.user.role);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Redirect to frontend with token in query param
    // The frontend will need a small logic to capture this token
    res.redirect(`${frontendUrl}/auth/login?token=${token}`);
  }
);

module.exports = router;
