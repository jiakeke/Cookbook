const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload');
const Comment = require('../../models/Comment');
const Recipe = require('../../models/Recipe');

// @route   POST api/comments/:recipeId
// @desc    Add a comment to a recipe
// @access  Public
router.post('/:recipeId', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ msg: err });
    }

    const { content } = req.body;
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
      });

      await newComment.save();

      res.status(201).json(newComment);

    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  });
});

module.exports = router;
