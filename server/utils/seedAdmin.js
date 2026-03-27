const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.collection.insertOne({
      name: 'Admin',
      email: 'admin@netops.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Admin user created');
  } catch (err) {
    console.error('Seed admin failed:', err.message || err);
  } finally {
    await mongoose.connection.close();
  }
};

seedAdmin();
