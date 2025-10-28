const express = require('express');
const router = express.Router();
const Recipe = require('../../models/Recipe');
const Comment = require('../../models/Comment');

// @route   GET api/recipes
// @desc    Get all public recipes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('country_or_region')
      .populate('creator', 'name')
      .sort({ _id: -1 });
    res.json(recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/recipes/:id
// @desc    Get a single recipe by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('country_or_region')
      .populate('creator', 'name')
      .populate({
        path: 'ingredients.ingredient',
        model: 'ingredient',
        populate: [
          { path: 'link.store', model: 'store' },
          { path: 'allergens', model: 'allergen' },
          { path: 'specials', model: 'specialGroup' },
        ]
      })
      .populate('ingredients.method')
      .lean();

    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }

    recipe.comments = await Comment.find({ recipe: recipe._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
