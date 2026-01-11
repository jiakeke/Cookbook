const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    fi: { type: String },
    zh: { type: String },
  },
  logo: {
    type: String,
  },
});

module.exports = mongoose.model('store', StoreSchema);
