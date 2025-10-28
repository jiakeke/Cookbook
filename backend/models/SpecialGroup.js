const mongoose = require('mongoose');

const SpecialGroupSchema = new mongoose.Schema({
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

module.exports = mongoose.model('specialGroup', SpecialGroupSchema);
