const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sequelize = require('../config/database');

const resetUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log('Clearing ALL users and resetting ID counter...');
    
    // Postgres specific truncate with identity reset
    await sequelize.query('TRUNCATE TABLE "Users" RESTART IDENTITY CASCADE');
    
    // Create new admin
    const name = 'Admin User';
    const email = 'admin@gmail.com';
    const password = 'admin123';
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Database CLEARED and Fresh Admin created!');
    console.log(`ID: ${admin.id}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit();
  } catch (error) {
    console.error('Error resetting users:', error);
    process.exit(1);
  }
};

resetUsers();
