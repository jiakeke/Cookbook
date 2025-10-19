const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    fi: { type: String },
    zh: { type: String },
  },
  image: {
    type: String,
  },
  country_or_region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'countryOrRegion',
  },
  calorie: { type: Number }, // kcal
  protein: { type: Number }, // g
  carbohydrate: { type: Number }, // g
  fat: { type: Number }, // g
  preparation: {
    en: { type: String },
    fi: { type: String },
    zh: { type: String },
  },
  ingredients: [
    {
      ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ingredient',
      },
      quantity: { type: Number },
      unit: { type: String },
      optional: { type: Boolean, default: false },
      method: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'method',
      },
    },
  ],
});

module.exports = mongoose.model('recipe', RecipeSchema);
