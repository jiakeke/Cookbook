const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    // Not required if using SSO
  },
  avatar: {
    type: String,
  },
  birthday: {
    type: Date,
  },
  gender: {
    type: String,
  },
  height: {
    type: Number, // in centimeters
  },
  weight: {
    type: Number, // in kilograms
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  authProvider: {
    type: String,
    required: true,
    enum: ['local', 'google', 'facebook'],
    default: 'local',
  },
  providerId: {
    type: String,
    // Only for SSO users
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to hash password for local strategy
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new) and provider is 'local'
  if (this.authProvider !== 'local' || !this.isModified('password')) {
    return next();
  }
  if (!this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('user', UserSchema);