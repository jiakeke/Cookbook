const express = require('express');
const router = express.Router();
const passport = require('passport');
const upload = require('../../middleware/upload');
const Comment = require('../../models/Comment');
const Recipe = require('../../models/Recipe');

const getNextGuestNickname = async () => {
  const lastComment = await Comment.findOne({ nickname: /^Guest-/ }).sort({ createdAt: -1 });
  let nextNumber = 1;
  if (lastComment && lastComment.nickname) {
    const lastNumber = parseInt(lastComment.nickname.split('-')[1]);
    nextNumber = lastNumber + 1;
  }
  return `Guest-${String(nextNumber).padStart(4, '0')}`;
};

// @route   POST api/comments/:recipeId
// @desc    Add a comment to a recipe
// @access  Public
router.post('/:recipeId', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ msg: err });
      }

      const { content, nickname, rating } = req.body;
      if (!content) {
        return res.status(400).json({ msg: 'Content is required.' });
      }

      try {
        const recipe = await Recipe.findById(req.params.recipeId);
        if (!recipe) {
          return res.status(404).json({ msg: 'Recipe not found.' });
        }

        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const newComment = new Comment({
          recipe: req.params.recipeId,
          content,
          images,
          rating,
        });

        if (user) {
          newComment.user = user.id;
        } else {
          if (nickname) {
            newComment.nickname = nickname;
          } else {
            newComment.nickname = await getNextGuestNickname();
          }
        }

        await newComment.save();
        await newComment.populate('user');

        res.status(201).json(newComment);

      } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
      }
    });
  })(req, res, next);
});

module.exports = router;
