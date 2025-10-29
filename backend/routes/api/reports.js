const express = require('express');
const router = express.Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator');

const Report = require('../../models/Report');
const Comment = require('../../models/Comment');

// @route   POST api/reports/:commentId
// @desc    Report a comment
// @access  Private
router.post(
  '/:commentId',
  [
    passport.authenticate('jwt', { session: false }),
    check('reason', 'Reason is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comment = await Comment.findById(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ msg: 'Comment not found' });
      }

      // Check if user has already reported this comment
      const existingReport = await Report.findOne({ user: req.user.id, comment: req.params.commentId });
      if (existingReport) {
        return res.status(400).json({ msg: 'You have already reported this comment' });
      }

      const newReport = new Report({
        user: req.user.id,
        comment: req.params.commentId,
        reason: req.body.reason,
      });

      await newReport.save();

      res.json(newReport);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Comment not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
