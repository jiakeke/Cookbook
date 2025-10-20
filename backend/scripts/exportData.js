const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load env vars - assuming your .env is in the root of the backend folder
// If it's elsewhere, you might need to adjust the path.
// For this script, we assume a MONGO_URI is defined for the DB to export from.
dotenv.config({ path: path.join(__dirname, '..', '.env') });


// Load models
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const Method = require('../models/Method');
const Store = require('../models/Store');
const CountryOrRegion = require('../models/CountryOrRegion');

// Connect to DB
const connectDB = require('../config/db');

const exportData = async () => {
  await connectDB();

  try {
    console.log('Fetching data from database...');
    const users = await User.find({});
    const recipes = await Recipe.find({});
    const ingredients = await Ingredient.find({});
    const methods = await Method.find({});
    const stores = await Store.find({});
    const countryOrRegions = await CountryOrRegion.find({});

    console.log('Anonymizing user data...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const anonymizedUsers = users.map((user, index) => {
      return {
        ...user.toObject(),
        _id: user._id, // Preserve original ID for relationships
        name: `user${index + 1}`,
        email: `user${index + 1}@example.com`,
        password: hashedPassword,
        avatar: '',
        birthday: null,
        gender: 'other',
        height: null,
        weight: null,
        role: user.role, // Preserve role
        authProvider: 'local',
        providerId: null,
      };
    });

    const dataToExport = {
      users: anonymizedUsers,
      recipes,
      ingredients,
      methods,
      stores,
      countryOrRegions,
    };

    const outputPath = path.join(__dirname, 'seed-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(dataToExport, null, 2));

    console.log(`
Data successfully exported to ${outputPath}`);
    process.exit();
  } catch (err) {
    console.error('Error during data export:', err);
    process.exit(1);
  }
};

exportData();
