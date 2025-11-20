const express = require('express');
const router = express.Router();
const passport = require('passport');
const adminAuth = require('../../middleware/adminAuth');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const User = require('../../models/User');
const Method = require('../../models/Method');
const CountryOrRegion = require('../../models/CountryOrRegion');
const Store = require('../../models/Store');
const Ingredient = require('../../models/Ingredient');
const Recipe = require('../../models/Recipe');
const Allergen = require('../../models/Allergen');
const SpecialGroup = require('../../models/SpecialGroup');
const Report = require('../../models/Report');
const Comment = require('../../models/Comment');

// Middleware stack for all admin routes
const adminAccess = [passport.authenticate('jwt', { session: false }), adminAuth];

// --- User Routes ---
router.get('/users', adminAccess, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';
    const query = {
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
      ],
    };
    const users = await User.find(query).select('-password').populate('allergens').populate('specialGroups').limit(limit).skip((page - 1) * limit).sort({ date: -1 });
    const total = await User.countDocuments(query);
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.post('/users', [ ...adminAccess, check('name', 'Name is required').not().isEmpty(), check('email', 'Please include a valid email').isEmail(), check('password', 'Password must be at least 8 characters long').isLength({ min: 8 }), check('allergens').optional().isArray().withMessage('Allergens must be an array').custom((value) => { for (const id of value) { if (!mongoose.Types.ObjectId.isValid(id)) { throw new Error('Invalid ID in allergens'); } } return true; }), check('specialGroups').optional().isArray().withMessage('Special groups must be an array').custom((value) => { for (const id of value) { if (!mongoose.Types.ObjectId.isValid(id)) { throw new Error('Invalid ID in special groups'); } } return true; }), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password, role, allergens, specialGroups } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }
    user = new User({ 
      name, 
      email, 
      password, 
      role: role || 'user',
      allergens: allergens || [],
      specialGroups: specialGroups || []
    });
    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.put('/users/:id', [ ...adminAccess, check('name', 'Name is required').not().isEmpty(), check('email', 'Please include a valid email').isEmail(), check('role', 'Role is required').isIn(['user', 'admin']), check('allergens').optional().isArray().withMessage('Allergens must be an array').custom((value) => { for (const id of value) { if (!mongoose.Types.ObjectId.isValid(id)) { throw new Error('Invalid ID in allergens'); } } return true; }), check('specialGroups').optional().isArray().withMessage('Special groups must be an array').custom((value) => { for (const id of value) { if (!mongoose.Types.ObjectId.isValid(id)) { throw new Error('Invalid ID in special groups'); } } return true; }), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, role, allergens, specialGroups } = req.body;
  try {
    const userById = await User.findById(req.params.id);
    if (!userById) {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (userById.email !== email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ errors: [{ msg: 'Email already in use' }] });
      }
    }
    const updatedFields = { name, email, role, allergens, specialGroups };
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: updatedFields }, { new: true }).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/users/:id', adminAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (user.id.toString() === req.user.id.toString()) {
        return res.status(400).json({ msg: 'You cannot delete your own admin account.' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Method Routes ---
router.get('/methods', adminAccess, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';
    const query = searchQuery ? { $or: [ { 'name.en': { $regex: searchQuery, $options: 'i' } }, { 'name.fi': { $regex: searchQuery, $options: 'i' } }, { 'name.zh': { $regex: searchQuery, $options: 'i' } }, ], } : {};
    const methods = await Method.find(query).limit(limit).skip((page - 1) * limit).sort({ _id: -1 });
    const total = await Method.countDocuments(query);
    res.json({ methods, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.post('/methods', [ ...adminAccess, check('name.en', 'English name is required').not().isEmpty(), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name } = req.body;
  try {
    const newMethod = new Method({ name });
    await newMethod.save();
    res.status(201).json(newMethod);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.put('/methods/:id', [ ...adminAccess, check('name.en', 'English name is required').not().isEmpty(), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name } = req.body;
  try {
    const updatedMethod = await Method.findByIdAndUpdate(req.params.id, { $set: { name } }, { new: true });
    if (!updatedMethod) {
      return res.status(404).json({ msg: 'Method not found' });
    }
    res.json(updatedMethod);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/methods/:id', adminAccess, async (req, res) => {
  try {
    const method = await Method.findById(req.params.id);
    if (!method) {
      return res.status(404).json({ msg: 'Method not found' });
    }
    await Method.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Method deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- CountryOrRegion Routes ---
router.get('/countries', adminAccess, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';
    const query = searchQuery ? { $or: [ { 'name.en': { $regex: searchQuery, $options: 'i' } }, { 'name.fi': { $regex: searchQuery, $options: 'i' } }, { 'name.zh': { $regex: searchQuery, $options: 'i' } }, ], } : {};
    const countries = await CountryOrRegion.find(query).limit(limit).skip((page - 1) * limit).sort({ _id: -1 });
    const total = await CountryOrRegion.countDocuments(query);
    res.json({ countries, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.post('/countries', [ ...adminAccess, check('name.en', 'English name is required').not().isEmpty(), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, description } = req.body;
  try {
    const newCountry = new CountryOrRegion({ name, description });
    await newCountry.save();
    res.status(201).json(newCountry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.put('/countries/:id', [ ...adminAccess, check('name.en', 'English name is required').not().isEmpty(), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, description } = req.body;
  try {
    const updatedCountry = await CountryOrRegion.findByIdAndUpdate(req.params.id, { $set: { name, description } }, { new: true });
    if (!updatedCountry) {
      return res.status(404).json({ msg: 'Country or region not found' });
    }
    res.json(updatedCountry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/countries/:id', adminAccess, async (req, res) => {
  try {
    const country = await CountryOrRegion.findById(req.params.id);
    if (!country) {
      return res.status(404).json({ msg: 'Country or region not found' });
    }
    await CountryOrRegion.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Country or region deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Store Routes ---
router.get('/stores', adminAccess, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';
    const query = searchQuery ? { $or: [ { 'name.en': { $regex: searchQuery, $options: 'i' } }, { 'name.fi': { $regex: searchQuery, $options: 'i' } }, { 'name.zh': { $regex: searchQuery, $options: 'i' } }, ], } : {};
    const stores = await Store.find(query).limit(limit).skip((page - 1) * limit).sort({ _id: -1 });
    const total = await Store.countDocuments(query);
    res.json({ stores, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.post('/stores', [ ...adminAccess, check('name.en', 'English name is required').not().isEmpty(), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, logo } = req.body;
  try {
    const newStore = new Store({ name, logo });
    await newStore.save();
    res.status(201).json(newStore);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.put('/stores/:id', [ ...adminAccess, check('name.en', 'English name is required').not().isEmpty(), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, logo } = req.body;
  try {
    const updatedStore = await Store.findByIdAndUpdate(req.params.id, { $set: { name, logo } }, { new: true });
    if (!updatedStore) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    res.json(updatedStore);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/stores/:id', adminAccess, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    await Store.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Store deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Allergen Routes ---
router.get('/allergens', adminAccess, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';
    const query = searchQuery ? { $or: [ { 'name.en': { $regex: searchQuery, $options: 'i' } }, { 'name.fi': { $regex: searchQuery, $options: 'i' } }, { 'name.zh': { $regex: searchQuery, $options: 'i' } }, ], } : {};
    const allergens = await Allergen.find(query).limit(limit).skip((page - 1) * limit).sort({ _id: -1 });
    const total = await Allergen.countDocuments(query);
    res.json({ allergens, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.post('/allergens', [ ...adminAccess, check('name.en', 'English name is required').not().isEmpty(), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, description } = req.body;
  try {
    const newAllergen = new Allergen({ name, description });
    await newAllergen.save();
    res.status(201).json(newAllergen);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.put('/allergens/:id', [ ...adminAccess, check('name.en', 'English name is required').not().isEmpty(), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, description } = req.body;
  try {
    const updatedAllergen = await Allergen.findByIdAndUpdate(req.params.id, { $set: { name, description } }, { new: true });
    if (!updatedAllergen) {
      return res.status(404).json({ msg: 'Allergen not found' });
    }
    res.json(updatedAllergen);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/allergens/:id', adminAccess, async (req, res) => {
  try {
    const allergen = await Allergen.findById(req.params.id);
    if (!allergen) {
      return res.status(404).json({ msg: 'Allergen not found' });
    }
    await Allergen.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Allergen deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- SpecialGroup Routes ---
router.get('/specialgroups', adminAccess, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';
    const query = searchQuery ? { $or: [ { 'name.en': { $regex: searchQuery, $options: 'i' } }, { 'name.fi': { $regex: searchQuery, $options: 'i' } }, { 'name.zh': { $regex: searchQuery, $options: 'i' } }, ], } : {};
    const specialgroups = await SpecialGroup.find(query).limit(limit).skip((page - 1) * limit).sort({ _id: -1 });
    const total = await SpecialGroup.countDocuments(query);
    res.json({ specialgroups, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.post('/specialgroups', [ ...adminAccess, check('name.en', 'English name is required').not().isEmpty(), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, description } = req.body;
  try {
    const newSpecialGroup = new SpecialGroup({ name, description });
    await newSpecialGroup.save();
    res.status(201).json(newSpecialGroup);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.put('/specialgroups/:id', [ ...adminAccess, check('name.en', 'English name is required').not().isEmpty(), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, description } = req.body;
  try {
    const updatedSpecialGroup = await SpecialGroup.findByIdAndUpdate(req.params.id, { $set: { name, description } }, { new: true });
    if (!updatedSpecialGroup) {
      return res.status(404).json({ msg: 'Special group not found' });
    }
    res.json(updatedSpecialGroup);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/specialgroups/:id', adminAccess, async (req, res) => {
  try {
    const specialgroup = await SpecialGroup.findById(req.params.id);
    if (!specialgroup) {
      return res.status(404).json({ msg: 'Special group not found' });
    }
    await SpecialGroup.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Special group deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Ingredient Routes ---
router.get('/ingredients', adminAccess, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';
    const query = searchQuery ? { $or: [ { 'name.en': { $regex: searchQuery, $options: 'i' } }, { 'name.fi': { $regex: searchQuery, $options: 'i' } }, { 'name.zh': { $regex: searchQuery, $options: 'i' } }, ], } : {};
    const ingredients = await Ingredient.find(query).populate('link.store').populate('allergens').populate('specials').limit(limit).skip((page - 1) * limit).sort({ _id: -1 });
    const total = await Ingredient.countDocuments(query);
    res.json({ ingredients, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.post('/ingredients', [ ...adminAccess, check('name.en', 'English name is required').not().isEmpty(), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, image, link, allergens, specials } = req.body;
  try {
    const newIngredient = new Ingredient({ name, image, link, allergens, specials });
    await newIngredient.save();
    await newIngredient.populate('link.store allergens specials');
    res.status(201).json(newIngredient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.put('/ingredients/:id', [ ...adminAccess, check('name.en', 'English name is required').not().isEmpty(), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, image, link, allergens, specials } = req.body;
  try {
    const updatedIngredient = await Ingredient.findByIdAndUpdate(req.params.id, { $set: { name, image, link, allergens, specials } }, { new: true }).populate('link.store allergens specials');
    if (!updatedIngredient) {
      return res.status(404).json({ msg: 'Ingredient not found' });
    }
    res.json(updatedIngredient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/ingredients/:id', adminAccess, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ msg: 'Ingredient not found' });
    }
    await Ingredient.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Ingredient deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Recipe Routes ---
router.get('/recipes/dependencies', adminAccess, async (req, res) => {
  try {
    const [countries, ingredients, methods, allergens, specialgroups] = await Promise.all([
      CountryOrRegion.find().sort({ 'name.en': 1 }),
      Ingredient.find().sort({ 'name.en': 1 }),
      Method.find().sort({ 'name.en': 1 }),
      Allergen.find().sort({ 'name.en': 1 }),
      SpecialGroup.find().sort({ 'name.en': 1 }),
    ]);
    res.json({ countries, ingredients, methods, allergens, specialgroups });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.get('/recipes', adminAccess, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';
    const query = searchQuery ? { $or: [ { 'name.en': { $regex: searchQuery, $options: 'i' } }, { 'name.fi': { $regex: searchQuery, $options: 'i' } }, { 'name.zh': { $regex: searchQuery, $options: 'i' } }, ], } : {};
    const recipes = await Recipe.find(query).populate('country_or_region').populate('ingredients.ingredient').populate('ingredients.method').populate('creator').populate({ path: 'comments', populate: { path: 'user' } }).limit(limit).skip((page - 1) * limit).sort({ _id: -1 });
    const total = await Recipe.countDocuments(query);
    res.json({ recipes, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.post('/recipes', [ ...adminAccess, check('name.en', 'English name is required').not().isEmpty(), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const newRecipe = new Recipe({ ...req.body, creator: req.user.id });
    await newRecipe.save();
    await newRecipe.populate('country_or_region ingredients.ingredient ingredients.method creator');
    res.status(201).json(newRecipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.put('/recipes/:id', [ ...adminAccess, check('name.en', 'English name is required').not().isEmpty(), ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).populate('country_or_region ingredients.ingredient ingredients.method creator');
    if (!updatedRecipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    res.json(updatedRecipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/recipes/:id', adminAccess, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Recipe deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Report Routes ---
router.get('/reports', adminAccess, async (req, res) => {
  try {
    const reports = await Report.aggregate([
      {
        $addFields: {
          statusOrder: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 'New'] }, then: 1 },
                { case: { $eq: ['$status', 'Accepted'] }, then: 2 },
                { case: { $eq: ['$status', 'Rejected'] }, then: 3 },
              ],
              default: 4,
            },
          },
        },
      },
      {
        $sort: {
          statusOrder: 1,
          createdAt: -1,
        },
      },
    ]);

    await Report.populate(reports, { path: 'user', select: 'name' });
    await Report.populate(reports, { path: 'comment', select: 'content approved' });

    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.put('/reports/:reportId', adminAccess, async (req, res) => {
  const { status } = req.body;
  const { reportId } = req.params;
  if (!['New', 'Accepted', 'Rejected'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }
  try {
    const report = await Report.findById(reportId).populate('comment');
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    const originalStatus = report.status;
    report.status = status;

    if (originalStatus !== status) {
        let commentApproved = report.comment.approved;
        switch (status) {
            case 'Accepted':
                commentApproved = false;
                break;
            case 'Rejected':
            case 'New':
                commentApproved = true;
                break;
        }
        await Comment.findByIdAndUpdate(report.comment._id, { approved: commentApproved });
    }

    await report.save();
    await report.populate('user', 'name');
    // Re-populate comment to get the latest approved status
    await report.populate({ path: 'comment', select: 'content approved' });

    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
