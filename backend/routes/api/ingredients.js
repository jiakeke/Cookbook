const express = require('express');
const router = express.Router();
const Ingredient = require('../../models/Ingredient');
const Recipe = require('../../models/Recipe');

// @route   GET api/ingredients
// @desc    Get all ingredients
// @access  Public
router.get('/', async (req, res) => {
  try {
    const ingredients = await Ingredient.find()
      .populate('link.store')
      .populate('allergens')
      .populate('specials')
      .sort({ 'name.en': 1 });
    res.json(ingredients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/ingredients/:id
// @desc    Get a single ingredient by ID and recipes that use it
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id)
      .populate('link.store')
      .populate('allergens')
      .populate('specials')
      .lean();

    if (!ingredient) {
      return res.status(404).json({ msg: 'Ingredient not found' });
    }

    // Find recipes that use this ingredient
    const recipes = await Recipe.find({ 'ingredients.ingredient': req.params.id })
      .populate('country_or_region')
      .populate('creator', 'name');

    res.json({ ingredient, recipes });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ingredient not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
