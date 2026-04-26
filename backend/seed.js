const sequelize = require('./config/database');
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');
const Review = require('./models/Review');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });

    const casual = await Category.create({ name: 'Casual' });
    const formal = await Category.create({ name: 'Formal' });
    const party = await Category.create({ name: 'Party' });
    const gym = await Category.create({ name: 'Gym' });

    const products = await Product.bulkCreate([
      { name: "T-shirt with Tape Details", price: 120, rating: 4.5, CategoryId: casual.id, brand: 'ZARA' },
      { name: "Skinny Fit Jeans", price: 240, originalPrice: 260, rating: 3.5, CategoryId: casual.id, brand: 'PRADA' },
      { name: "Checkered Shirt", price: 180, rating: 4.5, CategoryId: casual.id, brand: 'GUCCI' },
      { name: "Sleeve Striped T-shirt", price: 130, originalPrice: 160, rating: 4.5, CategoryId: casual.id, brand: 'ZARA' },

      { name: "Vertical Striped Shirt", price: 212, originalPrice: 232, rating: 5.0, CategoryId: formal.id, brand: 'VERSACE' },
      { name: "Courage Graphic T-shirt", price: 145, rating: 4.0, CategoryId: casual.id, brand: 'ZARA' },
      { name: "Loose Fit Bermuda Shorts", price: 80, rating: 3.0, CategoryId: gym.id, brand: 'Calvin Klein' },
      { name: "Faded Skinny Jeans", price: 210, rating: 4.5, CategoryId: casual.id, brand: 'PRADA' },
    ]);

    const user1 = await User.create({ name: 'Sarah M.', email: 'sarah@example.com', password: 'password123', role: 'customer' });
    const user2 = await User.create({ name: 'Alex K.', email: 'alex@example.com', password: 'password123', role: 'customer' });
    const user3 = await User.create({ name: 'James L.', email: 'james@example.com', password: 'password123', role: 'customer' });

    // Site-wide Testimonials (no ProductId)
    await Review.bulkCreate([
      { rating: 5, content: "I'm blown away by the quality and style of the clothes I received from SHOP.CO.", UserId: user1.id },
      { rating: 5, content: "Finding clothes that align with my personal style used to be a challenge until I discovered SHOP.CO.", UserId: user2.id },
      { rating: 5, content: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon SHOP.CO.", UserId: user3.id }
    ]);

    // Product-specific Reviews
    await Review.bulkCreate([
      { rating: 5, content: "Perfect fit and amazing fabric!", UserId: user1.id, ProductId: products[0].id },
      { rating: 4, content: "Very stylish, though the color is slightly different than in pictures.", UserId: user2.id, ProductId: products[0].id },
      { rating: 5, content: "Absolutely love these jeans!", UserId: user3.id, ProductId: products[1].id }
    ]);

    console.log('Database seeded!');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seed();
