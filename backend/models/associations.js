const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Review = require('./Review');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const ProductImage = require('./ProductImage');
const Notification = require('./Notification');
const Address = require('./Address');

// Define associations
User.hasMany(Product, { foreignKey: 'sellerId' });
Product.belongsTo(User, { foreignKey: 'sellerId' });

Category.hasMany(Product);
Product.belongsTo(Category);

Product.hasMany(ProductImage, { as: 'images' });
ProductImage.belongsTo(Product);

User.hasMany(Review);
Review.belongsTo(User);

Product.hasMany(Review);
Review.belongsTo(Product);

User.hasMany(Order);
Order.belongsTo(User);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

User.hasMany(Notification);
Notification.belongsTo(User);

User.hasMany(Address, { foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Product,
  Category,
  Review,
  Order,
  OrderItem,
  ProductImage,
  Notification,
  Address
};
