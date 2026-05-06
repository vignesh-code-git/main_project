const { User, Product, WebsiteSettings, Category, Notification } = require('../models/associations');

// @desc    Get all users (customers)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: 'customer' },
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sellers
// @route   GET /api/admin/sellers
// @access  Private/Admin
const getAllSellers = async (req, res) => {
  try {
    const sellers = await User.findAll({
      where: { role: 'seller' },
      attributes: { exclude: ['password'] }
    });
    res.json(sellers);
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

module.exports = {
  getAllUsers,
  getAllSellers,
  getSettings,
  updateSettings,
  addCategory,
  deleteCategory
};
