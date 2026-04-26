const sequelize = require('../config/database');
const Product = require('../models/Product');
const Review = require('../models/Review');
const ProductImage = require('../models/ProductImage');

const clearDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Clearing database to prove dynamic logic...');
    
    // Delete all reviews, images, and products
    await Review.destroy({ where: {}, cascade: true });
    await ProductImage.destroy({ where: {}, cascade: true });
    await Product.destroy({ where: {}, cascade: true });
    
    console.log('Database CLEARED! Check the homepage now. It should be empty.');
    process.exit();
  } catch (err) {
    console.error('Clear Failed:', err);
    process.exit(1);
  }
};

clearDB();
