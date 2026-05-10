const { User, Product, WebsiteSettings, Category, Notification, Brand, Style, Size, Color } = require('../models/associations');

// @desc    Get all users (customers)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows: users } = await User.findAndCountAll({
      where: { role: 'customer' },
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      users,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllSellers = async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: sellers } = await User.findAndCountAll({
      where: { role: 'seller' },
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      sellers,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get website settings
// @route   GET /api/admin/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    const settings = await WebsiteSettings.findAll();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update website settings/images
// @route   POST /api/admin/settings/upload
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const { key } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const value = `/uploads/${req.file.filename}`;

    // Find if setting exists, then update or create
    let setting = await WebsiteSettings.findOne({ where: { key } });
    
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await WebsiteSettings.create({
        key,
        value,
        type: 'image'
      });
    }

    // Notify all admins about the change
    try {
      const { Notification } = require('../models/associations');
      await Notification.create({
        role: 'admin',
        userId: null, // Global for all admins
        title: 'System Settings Updated',
        message: `Admin setting "${key}" has been updated.`,
        type: 'system',
        actorId: req.user.id,
        metadata: {
          key,
          imageUrl: value
        }
      });
    } catch (notifErr) {
      console.error('Failed to create admin notification:', notifErr);
    }

    res.json({ 
      message: 'Settings updated successfully',
      setting 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new category
// @route   POST /api/admin/categories
// @access  Private/Admin
const addCategory = async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await Category.create({ name, imageUrl });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    const productCount = await Product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return res.status(400).json({ message: `Cannot delete category: it contains ${productCount} products.` });
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: categories } = await Category.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });
    res.json({ categories, total: count, totalPages: Math.ceil(count / limit), currentPage: parseInt(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getBrands = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: brands } = await Brand.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });
    res.json({ brands, total: count, totalPages: Math.ceil(count / limit), currentPage: parseInt(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getStyles = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: styles } = await Style.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });
    res.json({ styles, total: count, totalPages: Math.ceil(count / limit), currentPage: parseInt(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getSizes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: sizes } = await Size.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.json({ sizes, total: count, totalPages: Math.ceil(count / limit), currentPage: parseInt(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getColors = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: colors } = await Color.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });
    res.json({ colors, total: count, totalPages: Math.ceil(count / limit), currentPage: parseInt(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- Brand Management ---
const addBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const brand = await Brand.create({ name });
    res.status(201).json(brand);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
const deleteBrand = async (req, res) => {
  try {
    await Brand.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Brand deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- Style Management ---
const addStyle = async (req, res) => {
  try {
    const { name } = req.body;
    const style = await Style.create({ name });
    res.status(201).json(style);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
const deleteStyle = async (req, res) => {
  try {
    await Style.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Style deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- Size Management ---
const addSize = async (req, res) => {
  try {
    const { name } = req.body;
    const size = await Size.create({ name });
    res.status(201).json(size);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
const deleteSize = async (req, res) => {
  try {
    await Size.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Size deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- Color Management ---
const addColor = async (req, res) => {
  try {
    const { name, hexCode } = req.body;
    const color = await Color.create({ name, hexCode });
    res.status(201).json(color);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
const deleteColor = async (req, res) => {
  try {
    await Color.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Color deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
  getAllUsers,
  getAllSellers,
  getSettings,
  updateSettings,
  addCategory,
  deleteCategory,
  addBrand,
  deleteBrand,
  addStyle,
  deleteStyle,
  addSize,
  deleteSize,
  addColor,
  deleteColor
};
