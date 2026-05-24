const Sprint = require('../models/Sprint');
const Issue = require('../models/Issue');
const Activity = require('../models/Activity');

// @desc    Get sprints for a project
// @route   GET /api/sprints?project=:projectId
exports.getSprints = async (req, res) => {
  try {
    const { project } = req.query;
    const filter = project ? { project } : {};
    const sprints = await Sprint.find(filter)
      .populate('project', 'name key')
      .sort({ order: 1, createdAt: -1 });
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single sprint
// @route   GET /api/sprints/:id
exports.getSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      .populate('project', 'name key');
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }
    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create sprint
// @route   POST /api/sprints
exports.createSprint = async (req, res) => {
  try {
    const { project, name, goal, startDate, endDate } = req.body;
    
    const sprintCount = await Sprint.countDocuments({ project });
    
    const sprint = await Sprint.create({
      project,
      name: name || `Sprint ${sprintCount + 1}`,
      goal,
      startDate,
      endDate,
      order: sprintCount
    });

    await Activity.create({
      project,
      user: req.user._id,
      action: 'created_sprint',
      details: `Created sprint "${sprint.name}"`
    });

    res.status(201).json(sprint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update sprint
// @route   PUT /api/sprints/:id
exports.updateSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }
    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Start a sprint
// @route   PUT /api/sprints/:id/start
exports.startSprint = async (req, res) => {
  try {
    // Check no other active sprint
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    const activeSprint = await Sprint.findOne({ project: sprint.project, status: 'active' });
    if (activeSprint) {
      return res.status(400).json({ message: 'Another sprint is already active. Complete it first.' });
    }

    sprint.status = 'active';
    sprint.startDate = req.body.startDate || new Date();
    sprint.endDate = req.body.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
    await sprint.save();

    await Activity.create({
      project: sprint.project,
      user: req.user._id,
      action: 'started_sprint',
      details: `Started sprint "${sprint.name}"`
    });

    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete a sprint
// @route   PUT /api/sprints/:id/complete
exports.completeSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    sprint.status = 'completed';
    sprint.endDate = new Date();
    await sprint.save();

    // Move incomplete issues back to backlog
    const incompleteCount = await Issue.updateMany(
      { sprint: sprint._id, status: { $nin: ['done'] } },
      { $set: { sprint: null, status: 'backlog' } }
    );

    await Activity.create({
      project: sprint.project,
      user: req.user._id,
      action: 'completed_sprint',
      details: `Completed sprint "${sprint.name}". ${incompleteCount.modifiedCount} issues moved to backlog.`
    });

    res.json({ sprint, movedToBacklog: incompleteCount.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete sprint
// @route   DELETE /api/sprints/:id
exports.deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }
    // Move issues back to backlog
    await Issue.updateMany({ sprint: sprint._id }, { $set: { sprint: null } });
    res.json({ message: 'Sprint deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
