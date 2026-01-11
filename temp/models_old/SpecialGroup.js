const mongoose = require('mongoose');

const SpecialGroupSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    fi: { type: String },
    zh: { type: String },
  },
  description: { type: String }, // 可选说明，例如“适合素食者”或“低糖饮食人群”
});

module.exports = mongoose.model('SpecialGroup', SpecialGroupSchema);
