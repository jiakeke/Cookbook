const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'recipe',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('comment', CommentSchema);
