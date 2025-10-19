const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const migrateData = async () => {
  try {
    await connectDB();

    // --- Schema Migration ---
    console.log('Starting user schema migration...');
    const result = await User.updateMany(
      { role: { $exists: false } },
      {
        $set: {
          role: 'user',
          birthday: null,
          gender: null,
          height: null,
          weight: null,
        },
      }
    );
    if (result.nModified > 0) {
        console.log(`- Schema migration: Updated ${result.nModified} users to include new fields.`);
    } else {
        console.log('- Schema migration: All users already conform to the new schema.');
    }

    // --- Seed Admin User ---
    console.log('\nSeeding admin user...');
    const adminEmail = 'admin@example.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('- Admin user already exists.');
    } else {
      const adminUser = new User({
        name: 'Admin',
        email: adminEmail,
        password: 'admin', // Password will be hashed by the pre-save hook
        role: 'admin',
      });
      await adminUser.save();
      console.log('- Admin user created successfully!');
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: admin`);
    }

  } catch (error) {
    console.error('\nOperation failed:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('\nDatabase connection closed.');
  }
};

migrateData();