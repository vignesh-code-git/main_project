const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Category = require('../models/Category');
const User = require('../models/User');
const Review = require('../models/Review');
const fs = require('fs');
const csv = require('csv-parser');

exports.getAllProducts = async (req, res) => {
  try {
    const { categoryId, onSale, sellerId, minPrice, maxPrice, color, style, search, brand } = req.query;
    const { Op } = require('sequelize');
    let where = {};

    if (categoryId) where.CategoryId = categoryId;
    if (onSale) where.originalPrice = { [Op.ne]: null };
    if (sellerId) where.sellerId = sellerId;

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (brand) {
      where.brand = { [Op.like]: `%${brand}%` };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (color) {
      where.color = { [Op.like]: `%${color}%` };
    }

    if (style) {
      where.style = { [Op.like]: `%${style}%` };
    }

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
      limit: 8,
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
      limit: 8,
      include: [{ model: ProductImage, as: 'images' }]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, rating, description, CategoryId, brand, style, color } = req.body;
    const product = await Product.create({
      name,
      price,
      originalPrice,
      rating,
      description,
      CategoryId,
      brand,
      style,
      color,
      sellerId: req.user.id
    });

    if (req.files && Array.isArray(req.files)) {
      const images = req.files.map(file => {
        // Expecting fieldname like "images_Olive" or "images_Black"
        const colorMatch = file.fieldname.match(/^images_(.+)$/);
        return {
          url: `http://localhost:5000/uploads/${file.filename}`,
          ProductId: product.id,
          color: colorMatch ? colorMatch[1] : null
        };
      });
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
            const imageRecords = Array.isArray(imageLinks) ? imageLinks.map(url => ({
              url: url.trim(),
              ProductId: product.id
            })) : [];
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
    res.json(Array.isArray(products) ? products.map(p => p.brand).filter(b => b) : []);
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
      customers: userCount || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, description, CategoryId, brand, style, color } = req.body;
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
      style,
      color
    });

    // Handle new image uploads
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const ProductImage = require('../models/ProductImage');
      const images = req.files.map(file => {
        const colorMatch = file.fieldname.match(/^images_(.+)$/);
        return {
          url: `http://localhost:5000/uploads/${file.filename}`,
          ProductId: product.id,
          color: colorMatch ? colorMatch[1] : null
        };
      });
      await ProductImage.bulkCreate(images);
    }

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
