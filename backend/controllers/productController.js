const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Category = require('../models/Category');
const User = require('../models/User');
const Review = require('../models/Review');
const fs = require('fs');
const csv = require('csv-parser');

exports.getAllProducts = async (req, res) => {
  try {
    const { categoryId, onSale, sellerId } = req.query;
    let where = {};
    if (categoryId) where.CategoryId = categoryId;
    if (onSale) where.originalPrice = { [require('sequelize').Op.ne]: null };
    if (sellerId) where.sellerId = sellerId;

    const products = await Product.findAll({
      where,
      include: [
        { model: ProductImage, as: 'images' },
        { model: Category }
      ]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['createdAt', 'DESC']],
      limit: 4,
      include: [{ model: ProductImage, as: 'images' }]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTopSelling = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['rating', 'DESC']],
      limit: 4,
      include: [{ model: ProductImage, as: 'images' }]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, rating, description, CategoryId, brand } = req.body;
    const product = await Product.create({
      name,
      price,
      originalPrice,
      rating,
      description,
      CategoryId,
      brand,
      sellerId: req.user.id
    });

    if (req.files) {
      const images = req.files.map(file => ({
        url: `http://localhost:5000/uploads/${file.filename}`,
        ProductId: product.id
      }));
      await ProductImage.bulkCreate(images);
    }

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkUploadProducts = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload a CSV file' });

  const products = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => products.push(row))
    .on('end', async () => {
      try {
        const createdProducts = [];
        for (const p of products) {
          const product = await Product.create({
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice || null,
            rating: p.rating || 5,
            description: p.description,
            CategoryId: p.CategoryId,
            brand: p.brand,
            sellerId: req.user.id
          });

          if (p.images) {
            const imageLinks = p.images.split(',');
            const imageRecords = imageLinks.map(url => ({
              url: url.trim(),
              ProductId: product.id
            }));
            await ProductImage.bulkCreate(imageRecords);
          }
          createdProducts.push(product);
        }
        fs.unlinkSync(req.file.path);
        res.status(201).json({ message: `${createdProducts.length} products uploaded successfully.` });
      } catch (err) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: err.message });
      }
    });
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('brand')), 'brand']],
      raw: true
    });
    res.json(products.map(p => p.brand).filter(b => b));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: ProductImage, as: 'images' },
        { model: Category },
        {
          model: Review,
          include: [{ model: User, attributes: ['name'] }]
        }
      ]
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [productCount, brandCount, userCount] = await Promise.all([
      Product.count(),
      Product.count({ distinct: true, col: 'brand' }),
      User.count()
    ]);

    res.json({
      products: productCount || 0,
      brands: brandCount || 0,
      customers: (userCount || 0) + 30000
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, description, CategoryId, brand, style } = req.body;
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.update({
      name,
      price,
      originalPrice,
      description,
      CategoryId,
      brand,
      style
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
