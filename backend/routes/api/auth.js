const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
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
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });
      return res.json({ token });
    });
  })(req, res, next);
});

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