const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const passport = require('./config/passport');
const sequelize = require('./config/database');
require('./models/associations'); // LOAD ASSOCIATIONS FIRST
require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // Trust the first proxy (Render)
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

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'Sessions', // Optional
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: { 
    secure: true, // Always true for Render (HTTPS)
    sameSite: 'none', // Always 'none' for cross-site cookies
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Create the Sessions table if it doesn't exist
sessionStore.sync();

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
    // --- AUTO ADMIN SETUP ---
    try {
      const { User } = require('./models/associations');
      const bcrypt = require('bcryptjs');
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
      const adminExists = await User.findOne({ where: { email: adminEmail } });
      
      if (!adminExists) {
        console.log('⚠️ ADMIN NOT FOUND: Creating default admin account...');
        const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPass, salt);
        
        await User.create({
          name: process.env.ADMIN_NAME || 'Super Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          isActive: true
        });
        console.log('✅ AUTO-SETUP: Admin account created successfully!');
      } else {
        console.log('ℹ️ ADMIN CHECK: Admin account already exists.');
      }
    } catch (err) {
      console.log('Admin auto-setup failed:', err);
    }

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
