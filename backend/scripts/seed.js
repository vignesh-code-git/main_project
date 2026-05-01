require('dotenv').config();
const sequelize = require('../config/database');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Review = require('../models/Review');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const ProductImage = require('../models/ProductImage');

const seed = async () => {
  try {
    // Sync without forcing (keeps tables)
    await sequelize.sync();

    // Clear only specific tables to keep Users/Admin safe
    await Product.destroy({ where: {}, truncate: { cascade: true } });
    await Category.destroy({ where: {}, truncate: { cascade: true } });
    await Review.destroy({ where: {}, truncate: { cascade: true } });
    await Order.destroy({ where: {}, truncate: { cascade: true } });
    console.log('Product-related tables cleared. Admin/Users preserved.');

    const tshirts = await Category.create({ name: 'T-shirts' });
    const shorts = await Category.create({ name: 'Shorts' });
    const shirts = await Category.create({ name: 'Shirts' });
    const hoodie = await Category.create({ name: 'Hoodie' });
    const jeans = await Category.create({ name: 'Jeans' });

    const products = await Product.bulkCreate([
      { name: "T-shirt with Tape Details", price: 120, rating: 4.5, categoryId: tshirts.id, brand: 'ZARA', style: 'Casual', color: 'Red,Black,White', size: 'Medium,Large', stock: 50, deliveryDays: '2-3 Days', isFreeDelivery: true },
      { name: "Skinny Fit Jeans", price: 240, originalPrice: 260, rating: 3.5, categoryId: jeans.id, brand: 'PRADA', style: 'Casual', color: 'Blue,Black', size: 'Large,X-Large', stock: 35, deliveryDays: '3-5 Days', isFreeDelivery: true },
      { name: "Checkered Shirt", price: 180, rating: 4.5, categoryId: shirts.id, brand: 'GUCCI', style: 'Formal', color: 'Red,White', size: 'Medium,Large', stock: 20, deliveryDays: '1-2 Days', isFreeDelivery: true },
      { name: "Sleeve Striped T-shirt", price: 130, originalPrice: 160, rating: 4.5, categoryId: tshirts.id, brand: 'ZARA', style: 'Casual', color: 'Black,White', size: 'Small,Medium', stock: 15, deliveryDays: '2-4 Days', isFreeDelivery: true },

      { name: "Vertical Striped Shirt", price: 212, originalPrice: 232, rating: 5.0, categoryId: shirts.id, brand: 'VERSACE', style: 'Formal', color: 'Blue,White', size: 'Large,X-Large', stock: 10, deliveryDays: '3-5 Days', isFreeDelivery: true },
      { name: "Courage Graphic T-shirt", price: 145, rating: 4.0, categoryId: tshirts.id, brand: 'ZARA', style: 'Casual', color: 'Black,Orange', size: 'Small,Medium,Large', stock: 42, deliveryDays: '2-3 Days', isFreeDelivery: true },
      { name: "Loose Fit Bermuda Shorts", price: 80, rating: 3.0, categoryId: shorts.id, brand: 'Calvin Klein', style: 'Gym', color: 'Blue,Gray', size: 'Medium,Large', stock: 25, deliveryDays: '4-6 Days', isFreeDelivery: false },
      { name: "Faded Skinny Jeans", price: 210, rating: 4.5, categoryId: jeans.id, brand: 'PRADA', style: 'Casual', color: 'Blue,Gray', size: 'Small,Medium', stock: 3, deliveryDays: '3-5 Days', isFreeDelivery: true },
    ]);

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedCustomerPass = await bcrypt.hash('password123', salt);

    const [user1] = await User.findOrCreate({ 
      where: { email: 'sarah@example.com' },
      defaults: { name: 'Sarah M.', password: hashedCustomerPass, role: 'customer' }
    });
    const [user2] = await User.findOrCreate({ 
      where: { email: 'alex@example.com' },
      defaults: { name: 'Alex K.', password: hashedCustomerPass, role: 'customer' }
    });
    const [user3] = await User.findOrCreate({ 
      where: { email: 'james@example.com' },
      defaults: { name: 'James L.', password: hashedCustomerPass, role: 'customer' }
    });

    // Site-wide Testimonials (no productId)
    await Review.bulkCreate([
      { rating: 5, content: "I'm blown away by the quality and style of the clothes I received from SHOP.CO.", userId: user1.id },
      { rating: 5, content: "Finding clothes that align with my personal style used to be a challenge until I discovered SHOP.CO.", userId: user2.id },
      { rating: 5, content: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon SHOP.CO.", userId: user3.id }
    ]);

    // Product-specific Reviews
    await Review.bulkCreate([
      { rating: 5, content: "Perfect fit and amazing fabric!", userId: user1.id, productId: products[0].id },
      { rating: 4, content: "Very stylish, though the color is slightly different than in pictures.", userId: user2.id, productId: products[0].id },
      { rating: 5, content: "Absolutely love these jeans!", userId: user3.id, productId: products[1].id }
    ]);

    console.log('Database seeded!');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seed();
