const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
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
const path = require('path');

// Models for associations
const User = require('./models/User');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const Product = require('./models/Product');
const Review = require('./models/Review');

// Associations
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/reviews', reviewRoutes);

// Test DB Connection
sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err));

app.get('/', (req, res) => {
  res.send('SHOP.CO API is running...');
});

// Sync database and start server
sequelize.sync({ alter: true })
  .then(async () => {
    // DATA FIX: Assign orphan products to the first seller for demo/testing
    try {
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
