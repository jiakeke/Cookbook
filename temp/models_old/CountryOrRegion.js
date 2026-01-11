const mongoose = require('mongoose');

const CountryOrRegionSchema = new mongoose.Schema({
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

module.exports = mongoose.model('countryOrRegion', CountryOrRegionSchema);
