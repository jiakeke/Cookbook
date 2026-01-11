const mongoose = require('mongoose');

const AllergenSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    fi: { type: String },
    zh: { type: String },
  },
  description: { type: String }, // 可选说明，如“可能引发坚果过敏”
});

module.exports = mongoose.model('Allergen', AllergenSchema);
