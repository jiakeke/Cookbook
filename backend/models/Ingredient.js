const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    fi: { type: String },
    zh: { type: String },
  },
  image: {
    type: String,
  },
  link: [
    {
      uri: { type: String },
      price: { type: Number },
      size: { type: String },
      store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'store',
      },
    },
  ],
});

module.exports = mongoose.model('ingredient', IngredientSchema);
