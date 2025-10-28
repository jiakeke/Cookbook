const mongoose = require('mongoose');

const AllergenSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    fi: { type: String },
    zh: { type: String },
  },
  description: {
    en: { type: String },
    fi: { type: String },
    zh: { type: String },
  },
});

module.exports = mongoose.model('allergen', AllergenSchema);
