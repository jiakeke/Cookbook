const express = require('express');
const router = express.Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route   GET api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // req.user is attached by the passport-jwt strategy
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/me
// @desc    Update current user's profile
// @access  Private
router.put(
  '/me',
  [
    passport.authenticate('jwt', { session: false }),
    [
      check('name', 'Name is required').not().isEmpty(),
      // Optional validation for other fields
      check('birthday', 'Invalid date for birthday').optional({ checkFalsy: true }).isISO8601(),
      check('height', 'Height must be a number').optional({ checkFalsy: true }).isNumeric(),
      check('weight', 'Weight must be a number').optional({ checkFalsy: true }).isNumeric(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      birthday,
      gender,
      height,
      weight,
      avatar
    } = req.body;

    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (birthday) profileFields.birthday = birthday;
    if (gender) profileFields.gender = gender;
    if (height) profileFields.height = height;
    if (weight) profileFields.weight = weight;
    if (avatar) profileFields.avatar = avatar;

    try {
      let user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: profileFields },
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
