const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Allergen = require('../models/Allergen');
const Comment = require('../models/Comment');
const CountryOrRegion = require('../models/CountryOrRegion');
const Ingredient = require('../models/Ingredient');
const Method = require('../models/Method');
const Recipe = require('../models/Recipe');
const Report = require('../models/Report');
const SpecialGroup = require('../models/SpecialGroup');
const Store = require('../models/Store');
const User = require('../models/User');

const connectDB = require('../config/db');

const models = {
  allergens: Allergen,
  comments: Comment,
  countryOrRegions: CountryOrRegion,
  ingredients: Ingredient,
  methods: Method,
  recipes: Recipe,
  reports: Report,
  specialGroups: SpecialGroup,
  stores: Store,
  users: User,
};

const importData = async () => {
  await connectDB();
  try {
    const importFilePath = path.join(__dirname, 'db_export.json');
    if (!fs.existsSync(importFilePath)) {
      console.error(`Error: Import file not found at ${importFilePath}`);
      process.exit(1);
    }

    console.log('--- WARNING: This is a destructive operation. ---');
    console.log('Destroying existing data...');
    for (const key in models) {
      await models[key].deleteMany();
    }
    console.log('All existing data has been deleted.');

    console.log(`\nReading data from ${importFilePath}...`);
    const data = JSON.parse(fs.readFileSync(importFilePath, 'utf-8'));

    console.log('Importing new data...');
    for (const key in models) {
      if (data[key] && data[key].length > 0) {
        console.log(`Importing ${key}...`);
        // Using insertMany is efficient and bypasses pre-save hooks,
        // which is correct for importing pre-hashed user passwords.
        await models[key].insertMany(data[key]);
      }
    }

    console.log('\nData Imported Successfully!');
    process.exit();
  } catch (err) {
    console.error('Error during data import:', err);
    process.exit(1);
  }
};

importData();
