const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sequelize = require('../config/database');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const setupAdmin = async () => {
  try {
    // 1. Connect to Database
    await sequelize.authenticate();
    console.log('Database connected...');

    // 2. FORCE RESET: Delete all users and reset the ID counter
    // This is necessary to ensure the Admin can take ID 1
    await User.destroy({ where: {}, truncate: { cascade: true } });
    console.log('User table cleared and ID counter reset.');

    // 3. Get Credentials from Environment
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Super Admin';

    // 4. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 5. Create Admin with Explicit ID: 1
    const admin = await User.create({
      id: 1,
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      permissions: ['all']
    });

    console.log('-----------------------------------');
    console.log('Admin Setup Successful!');
    console.log(`Admin Name: ${admin.name}`);
    console.log(`Admin Email: ${admin.email}`);
    console.log(`Admin ID: ${admin.id}`);
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
};

setupAdmin();
