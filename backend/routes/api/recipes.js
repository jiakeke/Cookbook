const express = require('express');
const router = express.Router();
const Recipe = require('../../models/Recipe');

// @route   GET api/recipes
// @desc    Get all public recipes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('country_or_region')
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
      .populate({
        path: 'ingredients.ingredient',
        model: 'ingredient',
        populate: {
          path: 'link.store',
          model: 'store'
        }
      })
      .populate('ingredients.method')
      .populate('comments');

    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }

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
