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

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define Routes
app.get('/', (req, res) => res.send('API Running'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/recipes', require('./routes/api/recipes')); // Public recipe routes
app.use('/api/comments', require('./routes/api/comments')); // Public comment routes
app.use('/api/admin', require('./routes/api/admin')); // Admin routes

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
