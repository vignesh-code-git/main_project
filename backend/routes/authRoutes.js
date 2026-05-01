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
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Redirect to frontend home or dashboard
    res.redirect('http://localhost:3000/');
  }
);

module.exports = router;
