const Activity = require('../models/Activity');

// @desc    Get activities
// @route   GET /api/activities?project=:projectId&limit=20
exports.getActivities = async (req, res) => {
  try {
    const { project, limit = 20 } = req.query;
    const filter = project ? { project } : {};
    
    const activities = await Activity.find(filter)
      .populate('user', 'name email avatar')
      .populate('issue', 'title issueKey')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
