const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
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

const importData = async () => {
  await connectDB();
  try {
    console.log('Destroying existing data...');
    await User.deleteMany();
    await Recipe.deleteMany();
    await Ingredient.deleteMany();
    await Method.deleteMany();
    await Store.deleteMany();
    await CountryOrRegion.deleteMany();

    console.log('Reading seed data...');
    const seedDataPath = path.join(__dirname, 'seed-data.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

    console.log('Importing new data...');
    // We need to disable the pre-save hook for passwords temporarily
    // because the passwords in seed-data.json are already hashed.
    await User.create(seedData.users, { validateBeforeSave: false });
    await Recipe.insertMany(seedData.recipes);
    await Ingredient.insertMany(seedData.ingredients);
    await Method.insertMany(seedData.methods);
    await Store.insertMany(seedData.stores);
    await CountryOrRegion.insertMany(seedData.countryOrRegions);

    console.log('Data Imported!');
    process.exit();
  } catch (err) {
    console.error('Error during data import:', err);
    process.exit(1);
  }
};

const destroyData = async () => {
  await connectDB();
  try {
    console.log('Destroying all data...');
    await User.deleteMany();
    await Recipe.deleteMany();
    await Ingredient.deleteMany();
    await Method.deleteMany();
    await Store.deleteMany();
    await CountryOrRegion.deleteMany();
    
    console.log('Data Destroyed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  destroyData();
} else {
  console.log('Please use the -i flag to import or -d to destroy data.');
  process.exit();
}
