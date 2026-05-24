const Issue = require('../models/Issue');
const Activity = require('../models/Activity');

// @desc    Get issues (with filters)
// @route   GET /api/issues?project=&sprint=&status=&assignee=&type=&priority=
exports.getIssues = async (req, res) => {
  try {
    const { project, sprint, status, assignee, type, priority, search } = req.query;
    const filter = {};
    
    if (project) filter.project = project;
    if (sprint) filter.sprint = sprint;
    if (sprint === 'null') filter.sprint = null;
    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { issueKey: { $regex: search, $options: 'i' } }
      ];
    }

    const issues = await Issue.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key')
      .populate('sprint', 'name status')
      .sort({ order: 1, createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
exports.getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('assignee', 'name email avatar role')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key')
      .populate('sprint', 'name status')
      .populate('parent', 'title issueKey');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create issue
// @route   POST /api/issues
exports.createIssue = async (req, res) => {
  try {
    const { project, sprint, type, title, description, priority, assignee, labels, storyPoints, parent, dueDate } = req.body;

    const issueCount = await Issue.countDocuments({ project });
    const Project = require('../models/Project');
    const proj = await Project.findById(project);
    
    const issue = await Issue.create({
      project,
      sprint,
      issueKey: `${proj.key}-${issueCount + 1}`,
      type: type || 'task',
      title,
      description,
      status: sprint ? 'todo' : 'backlog',
      priority: priority || 'medium',
      assignee,
      reporter: req.user._id,
      labels: labels || [],
      storyPoints: storyPoints || 0,
      parent,
      order: issueCount,
      dueDate
    });

    await Activity.create({
      project,
      issue: issue._id,
      user: req.user._id,
      action: 'created_issue',
      details: `Created ${type || 'task'} "${title}"`
    });

    const populated = await Issue.findById(issue._id)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key')
      .populate('sprint', 'name status');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update issue
// @route   PUT /api/issues/:id
exports.updateIssue = async (req, res) => {
  try {
    const oldIssue = await Issue.findById(req.params.id);
    if (!oldIssue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const issue = await Issue.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    })
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key')
      .populate('sprint', 'name status');

    // Track status changes
    if (req.body.status && req.body.status !== oldIssue.status) {
      await Activity.create({
        project: issue.project._id,
        issue: issue._id,
        user: req.user._id,
        action: 'updated_status',
        details: `Moved "${issue.title}" from ${oldIssue.status} to ${req.body.status}`,
        metadata: { from: oldIssue.status, to: req.body.status }
      });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk update issues (for drag & drop reorder)
// @route   PUT /api/issues/bulk-update
exports.bulkUpdateIssues = async (req, res) => {
  try {
    const { updates } = req.body; // [{ id, status, order, sprint }]
    
    const promises = updates.map(update => 
      Issue.findByIdAndUpdate(update.id, {
        status: update.status,
        order: update.order,
        ...(update.sprint !== undefined && { sprint: update.sprint })
      }, { new: true })
    );

    await Promise.all(promises);
    res.json({ message: 'Issues updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json({ message: 'Issue deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get issue stats for dashboard
// @route   GET /api/issues/stats/:projectId
exports.getIssueStats = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [statusCounts, typeCounts, priorityCounts, totalPoints, completedPoints] = await Promise.all([
      Issue.aggregate([
        { $match: { project: require('mongoose').Types.ObjectId.createFromHexString(projectId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Issue.aggregate([
        { $match: { project: require('mongoose').Types.ObjectId.createFromHexString(projectId) } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Issue.aggregate([
        { $match: { project: require('mongoose').Types.ObjectId.createFromHexString(projectId) } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Issue.aggregate([
        { $match: { project: require('mongoose').Types.ObjectId.createFromHexString(projectId) } },
        { $group: { _id: null, total: { $sum: '$storyPoints' } } }
      ]),
      Issue.aggregate([
        { $match: { project: require('mongoose').Types.ObjectId.createFromHexString(projectId), status: 'done' } },
        { $group: { _id: null, total: { $sum: '$storyPoints' } } }
      ])
    ]);

    res.json({
      statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      typeCounts: typeCounts.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
      priorityCounts: priorityCounts.reduce((acc, p) => ({ ...acc, [p._id]: p.count }), {}),
      totalStoryPoints: totalPoints[0]?.total || 0,
      completedStoryPoints: completedPoints[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
