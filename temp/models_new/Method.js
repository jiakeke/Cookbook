const mongoose = require('mongoose');

const MethodSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    fi: { type: String },
    zh: { type: String },
  },
});

module.exports = mongoose.model('method', MethodSchema);
