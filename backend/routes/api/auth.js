const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const mongoose = require('mongoose');
require('dotenv').config();

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
    ).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        name,
        email,
        password,
        authProvider: 'local',
      });

      await user.save();

      const payload = {
        id: user.id,
        name: user.name,
        role: user.role,
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token (Local login)
// @access  Public
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ message: info.message });
    }
    req.logIn(user, { session: false }, (err) => {
      if (err) {
        res.status(500).send(err);
      }
      const payload = {
        id: user.id,
        name: user.name,
        role: user.role,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });
      return res.json({ token });
    });
  })(req, res, next);
});

// @route   POST api/auth/change-password
// @desc    Change user password
// @access  Private
router.post(
  '/change-password',
  [
    passport.authenticate('jwt', { session: false }),
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 8 characters long').isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      // We need to fetch the user with the password field
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Check if the current password matches
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Incorrect current password' });
      }

      // Set the new password and save. The pre-save hook will hash it.
      user.password = newPassword;
      await user.save();

      res.json({ msg: 'Password updated successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/auth/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // req.user is attached by the passport-jwt strategy
    const user = await User.findById(req.user.id).select('-password').populate('allergens').populate('specialGroups');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/auth/me
// @desc    Update current user's profile
// @access  Private
router.put(
  '/me',
  [
    passport.authenticate('jwt', { session: false }),
    check('name', 'Name is required').not().isEmpty(),
    // Optional validation for other fields
    check('birthday', 'Invalid date for birthday').optional({ checkFalsy: true }).isISO8601(),
    check('height', 'Height must be a number').optional({ checkFalsy: true }).isNumeric(),
    check('weight', 'Weight must be a number').optional({ checkFalsy: true }).isNumeric(),
    check('gender', 'Invalid gender').optional({ checkFalsy: true }).isIn(['male', 'female', 'other']),
    check('allergens').optional().isArray().withMessage('Allergens must be an array').custom((value) => {
      for (const id of value) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error('Invalid ID in allergens');
        }
      }
      return true;
    }),
    check('specialGroups').optional().isArray().withMessage('Special groups must be an array').custom((value) => {
      for (const id of value) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error('Invalid ID in special groups');
        }
      }
      return true;
    }),
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
      avatar,
      allergens,
      specialGroups
    } = req.body;

    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (birthday) profileFields.birthday = birthday;
    if (gender) profileFields.gender = gender;
    if (height) profileFields.height = height;
    if (weight) profileFields.weight = weight;
    if (avatar) profileFields.avatar = avatar;
    if (allergens) profileFields.allergens = allergens;
    if (specialGroups) profileFields.specialGroups = specialGroups;

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

// @route   GET api/auth/google
// @desc    Auth with Google (Placeholder)
// @access  Public
router.get('/google', (req, res) => {
  res.status(200).json({ message: 'Google SSO endpoint placeholder' });
});

// @route   GET api/auth/google/callback
// @desc    Google auth callback (Placeholder)
// @access  Public
router.get('/google/callback', (req, res) => {
  res.status(200).json({ message: 'Google SSO callback placeholder' });
});

// @route   GET api/auth/facebook
// @desc    Auth with Facebook (Placeholder)
// @access  Public
router.get('/facebook', (req, res) => {
  res.status(200).json({ message: 'Facebook SSO endpoint placeholder' });
});

// @route   GET api/auth/facebook/callback
// @desc    Facebook auth callback (Placeholder)
// @access  Public
router.get('/facebook/callback', (req, res) => {
  res.status(200).json({ message: 'Facebook SSO callback placeholder' });
});

module.exports = router;
