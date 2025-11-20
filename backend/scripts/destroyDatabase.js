const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

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

const destroyData = async () => {
  await connectDB();
  try {
    console.log('--- WARNING: This is a destructive operation. ---');
    console.log('Destroying all data in all collections...');
    for (const key in models) {
      await models[key].deleteMany();
    }
    console.log('All data has been deleted.');
    process.exit();
  } catch (err) {
    console.error('Error during data destruction:', err);
    process.exit(1);
  }
};

destroyData();
