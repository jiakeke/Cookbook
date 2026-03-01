const express = require('express');
const router = express.Router();
const passport = require('passport');
const { uploadCommentImages } = require('../../middleware/upload');
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
    uploadCommentImages(req, res, async (err) => {
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

// @route   POST api/comments/:id/like
// @desc    Like a comment
// @access  Public (Optional Auth)
router.post('/:id/like', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).json({ msg: 'Comment not found' });
      }

      if (user) {
        if (comment.likes_users.includes(user.id)) {
          return res.status(400).json({ msg: 'Comment already liked' });
        }
        comment.likes_users.push(user.id);
      } else {
        const { guestId } = req.body;
        if (!guestId) {
          return res.status(400).json({ msg: 'Guest ID is required' });
        }
        if (comment.likes_guests.includes(guestId)) {
          return res.status(400).json({ msg: 'Comment already liked' });
        }
        comment.likes_guests.push(guestId);
      }

      await comment.save();
      res.json({ 
        likes_users: comment.likes_users,
        likes_guests: comment.likes_guests 
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  })(req, res, next);
});

// @route   DELETE api/comments/:id/like
// @desc    Unlike a comment
// @access  Public (Optional Auth)
router.delete('/:id/like', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).json({ msg: 'Comment not found' });
      }

      if (user) {
        comment.likes_users = comment.likes_users.filter(id => id.toString() !== user.id.toString());
      } else {
        const { guestId } = req.body;
        if (!guestId) {
          return res.status(400).json({ msg: 'Guest ID is required' });
        }
        comment.likes_guests = comment.likes_guests.filter(id => id !== guestId);
      }

      await comment.save();
      res.json({ 
        likes_users: comment.likes_users,
        likes_guests: comment.likes_guests 
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  })(req, res, next);
});

module.exports = router;