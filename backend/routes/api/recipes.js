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
    const recipes = await Recipe.find({
      $or: [{ isOriginal: { $ne: false } }, { isPublic: true }],
    })
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
// @access  Public (with user-specific data if authenticated)
router.get('/:id', passport.authenticate(['jwt', 'anonymous'], { session: false }), async (req, res) => {
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

    // Add comments
    recipe.comments = await Comment.find({ recipe: recipe._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    // Check if the current user has favorited this recipe
    recipe.isFavorited = false;
    if (req.user) {
      const fork = await Recipe.findOne({ originalRecipe: recipe._id, creator: req.user.id });
      if (fork) {
        recipe.isFavorited = true;
      }
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

// @route   POST api/recipes/:id/favorite
// @desc    Favorite (fork) a recipe
// @access  Private
router.post('/:id/favorite', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const originalRecipe = await Recipe.findById(req.params.id).lean();
    if (!originalRecipe) {
      return res.status(404).json({ msg: 'Original recipe not found' });
    }

    // Check if user has already forked this recipe
    const existingFork = await Recipe.findOne({
      originalRecipe: originalRecipe._id,
      creator: req.user.id,
    });

    if (existingFork) {
      // User has already forked this, return the existing fork's ID
      return res.status(200).json({ newRecipeId: existingFork._id, message: 'Recipe already favorited.' });
    }

    // Create a copy
    const { _id, createdAt, updatedAt, ...recipeData } = originalRecipe;

    const newRecipe = new Recipe({
      ...recipeData,
      creator: req.user.id,
      isOriginal: false,
      originalRecipe: originalRecipe._id,
      // Reset likes and other user-specific data
      likes_users: [],
      likes_guests: [],
      name: { ...recipeData.name }, // Ensure name object is a new copy
      description: { ...recipeData.description },
      preparation: { ...recipeData.preparation },
      remark: { ...recipeData.remark },
    });

    await newRecipe.save();

    res.status(201).json({ newRecipeId: newRecipe._id });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/recipes/:id/favorite
// @desc    Unfavorite (un-fork) a recipe
// @access  Private
router.delete('/:id/favorite', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const originalRecipeId = req.params.id;
    const userId = req.user.id;

    const deletedRecipe = await Recipe.findOneAndDelete({
      originalRecipe: originalRecipeId,
      creator: userId,
    });

    if (!deletedRecipe) {
      return res.status(404).json({ msg: 'Favorite entry not found for this user and recipe.' });
    }

    res.json({ msg: 'Recipe removed from favorites.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;