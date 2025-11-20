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

const exportData = async () => {
  await connectDB();
  try {
    console.log('Exporting data from database...');
    const exportJson = {};
    
    for (const key in models) {
      console.log(`Fetching ${key}...`);
      exportJson[key] = await models[key].find({});
    }

    const outputPath = path.join(__dirname, 'db_export.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportJson, null, 2));

    console.log(`\nData successfully exported to ${outputPath}`);
    process.exit();
  } catch (err) {
    console.error('Error during data export:', err);
    process.exit(1);
  }
};

exportData();
