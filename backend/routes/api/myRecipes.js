const express = require('express');
const router = express.Router();
const passport = require('passport');
const Recipe = require('../../models/Recipe');
const { check, validationResult } = require('express-validator');

// @route   GET api/my-recipes
// @desc    Get all recipes created (forked) by the current user
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const recipes = await Recipe.find({
      creator: req.user.id,
      isOriginal: false,
    }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/my-recipes/:id
// @desc    Update a user's own recipe (a fork)
// @access  Private
router.put(
  '/:id',
  [
    passport.authenticate('jwt', { session: false }),
    [
      check('name.en', 'English name is required').not().isEmpty(),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let recipe = await Recipe.findById(req.params.id);

      if (!recipe) {
        return res.status(404).json({ msg: 'Recipe not found' });
      }

      // Check if the user owns the recipe
      if (recipe.creator.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      // User cannot change these fields
      if (req.body.isOriginal !== undefined || req.body.originalRecipe !== undefined) {
        return res.status(400).json({ msg: 'Cannot change original recipe status or reference.' });
      }
      
      // Build recipe object from request body
      const recipeFields = { ...req.body };

      recipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        { $set: recipeFields },
        { new: true }
      );

      res.json(recipe);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Recipe not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
