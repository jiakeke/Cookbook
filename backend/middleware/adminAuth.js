const adminAuth = (req, res, next) => {
  // Assumes that passport.authenticate('jwt') has already run and attached req.user
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Forbidden: Access is denied. Requires admin role.' });
  }
};

module.exports = adminAuth;
