const express = require('express');
const router = express.Router();
const Allergen = require('../../models/Allergen');

// @route   GET api/allergens
// @desc    Get all allergens
// @access  Public
router.get('/', async (req, res) => {
  try {
    const allergens = await Allergen.find().sort({ name: 1 });
    res.json(allergens);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
