const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 5.0
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

Review.belongsTo(User);
User.hasMany(Review);

const Product = require('./Product');
Review.belongsTo(Product);
Product.hasMany(Review);

module.exports = Review;
