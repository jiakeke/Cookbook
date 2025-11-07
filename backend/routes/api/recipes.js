const express = require('express');
const router = express.Router();
const passport = require('passport');
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

// @route   POST api/recipes/:id/like
// @desc    Like a recipe
// @access  Public (Optional Auth)
router.post('/:id/like', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ msg: 'Recipe not found' });
      }

      if (user) {
        // Logged-in user
        if (recipe.likes_users.includes(user.id)) {
          return res.status(400).json({ msg: 'Recipe already liked' });
        }
        recipe.likes_users.push(user.id);
      } else {
        // Anonymous guest
        const { guestId } = req.body;
        if (!guestId) {
          return res.status(400).json({ msg: 'Guest ID is required for anonymous likes' });
        }
        if (recipe.likes_guests.includes(guestId)) {
          return res.status(400).json({ msg: 'Recipe already liked' });
        }
        recipe.likes_guests.push(guestId);
      }

      await recipe.save();
      res.json({ 
        likes_users: recipe.likes_users,
        likes_guests: recipe.likes_guests 
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  })(req, res, next);
});

// @route   DELETE api/recipes/:id/like
// @desc    Unlike a recipe
// @access  Public (Optional Auth)
router.delete('/:id/like', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ msg: 'Recipe not found' });
      }

      if (user) {
        // Logged-in user
        recipe.likes_users = recipe.likes_users.filter(id => id.toString() !== user.id.toString());
      } else {
        // Anonymous guest
        const { guestId } = req.body;
        if (!guestId) {
          return res.status(400).json({ msg: 'Guest ID is required' });
        }
        recipe.likes_guests = recipe.likes_guests.filter(id => id !== guestId);
      }

      await recipe.save();
      res.json({ 
        likes_users: recipe.likes_users,
        likes_guests: recipe.likes_guests 
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  })(req, res, next);
});

module.exports = router;