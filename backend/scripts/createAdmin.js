const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sequelize = require('../config/database');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    
    const name = 'Admin User';
    const email = 'admin@gmail.com';
    const password = 'admin123';
    
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      console.log('Admin already exists!');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
