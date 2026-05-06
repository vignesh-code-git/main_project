const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');
const sequelize = require('./config/database');
require('./models/associations'); // LOAD ASSOCIATIONS FIRST
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const addressRoutes = require('./routes/addressRoutes');
const cartRoutes = require('./routes/cartRoutes');
const path = require('path');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-site cookies
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  proxy: true // Required for Render/Heroku to trust the X-Forwarded-Proto header
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/seller', require('./routes/sellerRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/cart', cartRoutes);

// Test DB Connection
sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err));

app.get('/', (req, res) => {
  res.send('SHOP.CO API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    errors: err.errors || null
  });
});

// Sync database and start server
sequelize.sync({ alter: true })
  .then(async () => {
    // DATA FIX: Assign orphan products to the first seller for demo/testing
    try {
      const { Product, User } = require('./models/associations');
      const orphanCount = await Product.count({ where: { sellerId: null } });
      if (orphanCount > 0) {
        const firstSeller = await User.findOne({ where: { role: 'seller' } });
        if (firstSeller) {
          await Product.update({ sellerId: firstSeller.id }, { where: { sellerId: null } });
          console.log(`FIXED: Assigned ${orphanCount} orphan products to seller: ${firstSeller.name}`);
        }
      }
    } catch (err) {
      console.log('Orphan fix failed:', err);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => console.log('Error syncing database: ' + err));
