const express = require('express');
const router = express.Router();
const SpecialGroup = require('../../models/SpecialGroup');

// @route   GET api/special-groups
// @desc    Get all special groups
// @access  Public
router.get('/', async (req, res) => {
  try {
    const specialGroups = await SpecialGroup.find().sort({ name: 1 });
    res.json(specialGroups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
