const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const Issue = require('../models/Issue');

// @desc    Get comments for an issue
// @route   GET /api/comments?issue=:issueId
exports.getComments = async (req, res) => {
  try {
    const { issue } = req.query;
    const comments = await Comment.find({ issue })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create comment
// @route   POST /api/comments
exports.createComment = async (req, res) => {
  try {
    const { issue, body } = req.body;

    const comment = await Comment.create({
      issue,
      author: req.user._id,
      body
    });

    const issueDoc = await Issue.findById(issue);

    await Activity.create({
      project: issueDoc.project,
      issue,
      user: req.user._id,
      action: 'added_comment',
      details: `Commented on "${issueDoc.title}"`
    });

    const populated = await Comment.findById(comment._id)
      .populate('author', 'name email avatar');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
