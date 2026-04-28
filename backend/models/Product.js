const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category');
const ProductImage = require('./ProductImage');
const User = require('./User');

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  originalPrice: {
    type: DataTypes.FLOAT,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  isNewArrival: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isTopSelling: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  style: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

Product.belongsTo(Category);
Category.hasMany(Product);
Product.hasMany(ProductImage, { as: 'images' });
ProductImage.belongsTo(Product);
Product.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });
User.hasMany(Product, { foreignKey: 'sellerId' });

module.exports = Product;
