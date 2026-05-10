const { Product, ProductImage, Category, User, Review, Brand, Style, Size, Color } = require('../models/associations');
const fs = require('fs');
const csv = require('csv-parser');

exports.getAllProducts = async (req, res) => {
  try {
    const { categoryId, onSale, sellerId, minPrice, maxPrice, color, style, search, brand, size, sortBy } = req.query;
    const { Op } = require('sequelize');
    let where = {};

    if (categoryId) where.categoryId = categoryId;
    if (onSale) where.originalPrice = { [Op.ne]: null };
    if (sellerId) where.sellerId = sellerId;

    if (search) {
      const searchTerms = search.split(' ').filter(t => t.length > 0);
      const searchConditions = searchTerms.map(term => ({
        [Op.or]: [
          { name: { [Op.iLike]: `%${term}%` } },
          { description: { [Op.iLike]: `%${term}%` } },
          { brand: { [Op.iLike]: `%${term}%` } },
          { style: { [Op.iLike]: `%${term}%` } },
          { '$Category.name$': { [Op.iLike]: `%${term}%` } }
        ]
      }));
      where[Op.and] = searchConditions;
    }

    if (brand) {
      where.brand = { [Op.iLike]: `%${brand}%` };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (color) {
      const colorArray = color.split(',');
      where.color = {
        [Op.or]: colorArray.map(c => ({
          [Op.iLike]: `%${c.trim()}%`
        }))
      };
    }

    if (style) {
      where.style = { [Op.iLike]: `%${style}%` };
    }

    if (size) {
      where.size = {
        [Op.regexp]: `(^|,)\\s*${size}\\s*(,|$)`
      };
    }

    let order = [['createdAt', 'DESC']];
    if (sortBy === 'price-asc') order = [['price', 'ASC']];
    if (sortBy === 'price-desc') order = [['price', 'DESC']];
    if (sortBy === 'newest') order = [['createdAt', 'DESC']];
    if (sortBy === 'oldest') order = [['createdAt', 'ASC']];
    if (sortBy === 'rating') order = [['rating', 'DESC'], ['numReviews', 'DESC']];
    if (sortBy === 'popular') order = [['rating', 'DESC'], ['numReviews', 'DESC']];

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order,
      include: [
        { model: ProductImage, as: 'images' },
        { model: Category }
      ],
      distinct: true // To get accurate count with includes
    });
    res.json({ products, total: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'newest', status = 'all' } = req.query;
    const offset = (page - 1) * limit;
    const { Op } = require('sequelize');

    const where = { sellerId: req.user.id };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status === 'active') {
      where.stock = { [Op.gt]: 0 };
    } else if (status === 'outofstock') {
      where.stock = 0;
    }

    let order = [['createdAt', 'DESC']];
    if (sortBy === 'price-asc') order = [['price', 'ASC']];
    if (sortBy === 'price-desc') order = [['price', 'DESC']];
    if (sortBy === 'stock-asc') order = [['stock', 'ASC']];
    if (sortBy === 'name') order = [['name', 'ASC']];

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        { model: ProductImage, as: 'images' },
        { model: Category }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    res.json({
      products,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });

  } catch (err) {
    console.error('GET SELLER PRODUCTS ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};


exports.getNewArrivals = async (req, res) => {
  try {
    const { color, style, size, minPrice, maxPrice, categoryId } = req.query;
    const { Op } = require('sequelize');
    let where = {};

    if (categoryId) where.categoryId = categoryId;
    if (color) {
      const colorArray = color.split(',');
      where.color = {
        [Op.or]: colorArray.map(c => ({
          [Op.iLike]: `%${c.trim()}%`
        }))
      };
    }
    if (style) where.style = { [Op.iLike]: `%${style}%` };
    if (size) {
      where.size = {
        [Op.regexp]: `(^|,)\\s*${size}\\s*(,|$)`
      };
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    console.log('Fetching new arrivals with where:', where);
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 20,
      include: [{ model: ProductImage, as: 'images' }],
      distinct: true
    });
    console.log(`Found ${products.length} new arrivals.`);
    res.json({ products, total: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTopSelling = async (req, res) => {
  try {
    const { color, style, size, minPrice, maxPrice, categoryId } = req.query;
    const { Op } = require('sequelize');
    let where = {};

    if (categoryId) where.categoryId = categoryId;
    if (color) {
      const colorArray = color.split(',');
      where.color = {
        [Op.or]: colorArray.map(c => ({
          [Op.iLike]: `%${c.trim()}%`
        }))
      };
    }
    if (style) where.style = { [Op.iLike]: `%${style}%` };
    if (size) {
      where.size = {
        [Op.regexp]: `(^|,)\\s*${size}\\s*(,|$)`
      };
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    console.log('Fetching top selling with where:', where);
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order: [['rating', 'DESC']],
      limit: 20,
      include: [{ model: ProductImage, as: 'images' }],
      distinct: true
    });
    console.log(`Found ${products.length} top selling products.`);
    res.json({ products, total: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    let { name, price, originalPrice, rating, description, categoryId, brand, style, color, size, details, isFreeDelivery, stock, sku, deliveryDays, videoUrl } = req.body;

    // Parse details if it comes as a string
    if (details && typeof details === 'string') {
      try {
        details = JSON.parse(details);
      } catch (e) {
        console.error("Failed to parse details JSON:", e);
      }
    }

    const product = await Product.create({
      name,
      price,
      originalPrice,
      rating,
      description,
      categoryId,
      brand,
      style,
      color,
      size,
      details,
      isFreeDelivery,
      stock,
      sku,
      deliveryDays,
      videoUrl: req.files && req.files.find(f => f.fieldname === 'video')
        ? `/uploads/${req.files.find(f => f.fieldname === 'video').filename}`
        : videoUrl,
      sellerId: req.user.id
    });

    if (req.files && Array.isArray(req.files)) {
      const images = req.files
        .filter(file => file.fieldname.startsWith('images_'))
        .map(file => {
          const colorMatch = file.fieldname.match(/^images_(.+)$/);
          return {
            url: `/uploads/${file.filename}`,
            productId: product.id,
            color: colorMatch ? colorMatch[1] : null
          };
        });
      await ProductImage.bulkCreate(images);
    }

    // Create Notification for Seller
    try {
      // Get the image url for notification (first uploaded image)
      const firstImageUrl = req.files && req.files.find(f => f.fieldname.startsWith('images_'))
        ? `/uploads/${req.files.find(f => f.fieldname.startsWith('images_')).filename}`
        : null;

      await Notification.create({
        userId: req.user.id,
        role: 'seller',
        title: 'Product Listed Successfully',
        message: `Your product "${product.name}" is now live on the store.`,
        type: 'inventory',
        actorId: req.user.id,
        metadata: {
          imageUrl: firstImageUrl,
          productId: product.id
        }
      });
    } catch (notifErr) {
      console.error('Failed to create notification:', notifErr);
    }

    res.status(201).json(product);
  } catch (err) {
    console.error('CREATE PRODUCT ERROR:', err);
    // Send detailed sequelize errors if they exist
    const errorMessage = err.errors ? err.errors.map(e => e.message).join(', ') : err.message;
    res.status(500).json({ message: errorMessage });
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
        const updatedProducts = [];
        const errors = [];

        for (const p of products) {
          try {
            // Parse complex fields
            let details = null;
            if (p.details) {
              try {
                details = typeof p.details === 'string' ? JSON.parse(p.details) : p.details;
              } catch (e) {
                console.warn(`Failed to parse details for product ${p.name}:`, e.message);
              }
            }

            const productData = {
              name: p.name,
              price: p.price,
              originalPrice: p.originalPrice || null,
              rating: p.rating || 5,
              description: p.description,
              categoryId: p.categoryId,
              brand: p.brand,
              style: p.style || 'Casual',
              color: p.color || 'Black',
              size: p.size || 'Medium',
              stock: p.stock || 0,
              sku: p.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              deliveryDays: p.deliveryDays || '3-5 Business Days',
              isFreeDelivery: String(p.isFreeDelivery).toLowerCase() === 'true',
              isNewArrival: String(p.isNewArrival).toLowerCase() === 'true',
              isTopSelling: String(p.isTopSelling).toLowerCase() === 'true',
              videoUrl: p.videoUrl || null,
              details: details,
              sellerId: req.user.id
            };

            // Check if product with same SKU exists for this seller
            let product = await Product.findOne({ where: { sku: productData.sku, sellerId: req.user.id } });

            if (product) {
              // Update existing product
              await product.update(productData);
              updatedProducts.push(product);
              console.log(`Successfully updated: ${product.name}`);
            } else {
              // Create new product
              product = await Product.create(productData);
              createdProducts.push(product);
              console.log(`Successfully created: ${product.name}`);
            }

            // Handle images (if provided in CSV, it REPLACES existing images for the product)
            if (p.images) {
              // Clear existing images for the product first
              await ProductImage.destroy({ where: { productId: product.id } });

              const imageLinks = p.images.split(',');
              
              // Try to associate images with the first color if available
              const firstColor = productData.color ? productData.color.split(',')[0].trim() : null;
              
              const imageRecords = imageLinks.map(url => ({
                url: url.trim(),
                productId: product.id,
                color: firstColor // Associate images with the primary color from CSV
              }));
              await ProductImage.bulkCreate(imageRecords);
            }

          } catch (itemErr) {
            console.error(`Error processing product "${p.name || 'Unknown'}":`, itemErr.message);
            errors.push({ name: p.name || 'Unknown', error: itemErr.message });
          }
        }

        try {
          if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (fsErr) {
          console.error('Failed to delete temp CSV:', fsErr);
        }

        if (createdProducts.length === 0 && updatedProducts.length === 0 && products.length > 0) {
          return res.status(400).json({
            message: 'Failed to process any products. Check errors list.',
            errors
          });
        }

        // Create Notification
        try {
          const { Notification } = require('../models/associations');
          await Notification.create({
            userId: req.user.id,
            role: 'seller',
            title: 'Bulk Upload Complete',
            message: `${createdProducts.length} created, ${updatedProducts.length} updated.`,
            type: 'inventory',
            actorId: req.user.id,
            metadata: {
              created: createdProducts.length,
              updated: updatedProducts.length,
              errors: errors.length
            }
          });
        } catch (notifErr) {
          console.error('Failed to create bulk notification:', notifErr);
        }

        res.status(201).json({
          message: `Bulk processing complete.`,
          summary: {
            created: createdProducts.length,
            updated: updatedProducts.length,
            errors: errors.length
          },
          errors: errors.length > 0 ? errors : undefined
        });
      } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: err.message });
      }
    });
};


exports.exportProductsToCSV = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { sellerId: req.user.id },
      include: [{ model: ProductImage, as: 'images' }]
    });

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found to export' });
    }

    const headers = [
      'name', 'sku', 'price', 'originalPrice', 'stock', 'categoryId',
      'brand', 'style', 'color', 'size', 'deliveryDays',
      'isFreeDelivery', 'isNewArrival', 'isTopSelling', 'videoUrl',
      'description', 'details', 'images'
    ];

    let csvContent = headers.join(',') + '\n';

    products.forEach(p => {
      const row = [
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.sku || '').replace(/"/g, '""')}"`,
        p.price || 0,
        p.originalPrice || '',
        p.stock || 0,
        p.categoryId || '',
        `"${(p.brand || '').replace(/"/g, '""')}"`,
        `"${(p.style || '').replace(/"/g, '""')}"`,
        `"${(p.color || '').replace(/"/g, '""')}"`,
        `"${(p.size || '').replace(/"/g, '""')}"`,
        `"${(p.deliveryDays || '').replace(/"/g, '""')}"`,
        p.isFreeDelivery ? 'true' : 'false',
        p.isNewArrival ? 'true' : 'false',
        p.isTopSelling ? 'true' : 'false',
        `"${(p.videoUrl || '').replace(/"/g, '""')}"`,
        `"${(p.description || '').replace(/"/g, '""')}"`,
        `"${JSON.stringify(p.details || {}).replace(/"/g, '""')}"`,
        `"${(p.images || []).map(img => img.url).join(',')}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=inventory_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('EXPORT CSV ERROR:', err);
    res.status(500).json({ message: err.message });
  }
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
    const brands = await Brand.findAll({ order: [['name', 'ASC']] });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStyles = async (req, res) => {
  try {
    const styles = await Style.findAll({ order: [['name', 'ASC']] });
    res.json(styles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSizes = async (req, res) => {
  try {
    const sizes = await Size.findAll(); // Order as added or add a position field later
    res.json(sizes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getColors = async (req, res) => {
  try {
    const colors = await Color.findAll({ order: [['name', 'ASC']] });
    res.json(colors);
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
    let { name, price, originalPrice, description, categoryId, brand, style, color, size, details, isFreeDelivery, stock, sku, deliveryDays, videoUrl } = req.body;

    if (details && typeof details === 'string') {
      try {
        details = JSON.parse(details);
      } catch (e) {
        console.error("Failed to parse details JSON:", e);
      }
    }

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.update({
      name,
      price,
      originalPrice,
      description,
      categoryId,
      brand,
      style,
      color,
      size,
      details,
      isFreeDelivery,
      stock,
      sku,
      deliveryDays,
      videoUrl: req.files && req.files.find(f => f.fieldname === 'video')
        ? `/uploads/${req.files.find(f => f.fieldname === 'video').filename}`
        : videoUrl
    });

    // Handle Image Deletions
    const { deletedImageIds } = req.body;
    if (deletedImageIds) {
      const idsToDelete = Array.isArray(deletedImageIds)
        ? deletedImageIds
        : deletedImageIds.split(',').filter(id => id.trim() !== '');

      if (idsToDelete.length > 0) {
        await ProductImage.destroy({
          where: {
            id: idsToDelete,
            productId: product.id
          }
        });
      }
    }

    // Handle NEW images uploaded during update
    if (req.files && Array.isArray(req.files)) {
      const newImages = req.files
        .filter(file => file.fieldname.startsWith('images_'))
        .map(file => {
          const colorMatch = file.fieldname.match(/^images_(.+)$/);
          return {
            url: `/uploads/${file.filename}`,
            productId: product.id,
            color: colorMatch ? colorMatch[1] : null
          };
        });

      if (newImages.length > 0) {
        await ProductImage.bulkCreate(newImages);
      }
    }

    // Create Notification
    try {
      const { Notification } = require('../models/associations');
      const firstImage = await ProductImage.findOne({ where: { productId: product.id } });

      await Notification.create({
        userId: req.user.id,
        role: 'seller',
        title: 'Product Updated',
        message: `Your product "${product.name}" has been updated successfully.`,
        type: 'inventory',
        actorId: req.user.id,
        metadata: {
          imageUrl: firstImage?.url,
          productId: product.id
        }
      });
    } catch (notifErr) {
      console.error('Failed to update notification:', notifErr);
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

    const productName = product.name;
    await product.destroy();

    // Create Notification
    try {
      const { Notification } = require('../models/associations');
      await Notification.create({
        userId: req.user.id,
        role: 'seller',
        title: 'Product Deleted',
        message: `"${productName}" has been removed from your store.`,
        type: 'inventory',
        actorId: req.user.id
      });
    } catch (notifErr) {
      console.error('Failed to delete notification:', notifErr);
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
