require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const passport = require('./config/passport');

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
  credentials: true
}));
app.use(express.json({ extended: false }));
app.use(passport.initialize());

// Define Routes
app.get('/', (req, res) => res.send('API Running'));
app.use('/api/auth', require('./routes/api/auth'));

// Protected route example
app.get('/api/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    message: 'You made it to the secure route',
    user: req.user,
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));