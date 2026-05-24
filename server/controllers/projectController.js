const Project = require('../models/Project');
const Activity = require('../models/Activity');

// @desc    Get all projects
// @route   GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('lead', 'name email avatar')
      .populate('members', 'name email avatar role')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('lead', 'name email avatar')
      .populate('members', 'name email avatar role designation');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create project
// @route   POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { name, key, description, category, color, members } = req.body;
    
    const project = await Project.create({
      name,
      key: key.toUpperCase(),
      description,
      lead: req.user._id,
      category,
      color,
      members: members || [req.user._id]
    });

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'created_project',
      details: `Created project "${project.name}"`
    });

    const populated = await Project.findById(project._id)
      .populate('lead', 'name email avatar')
      .populate('members', 'name email avatar role');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, runValidators: true 
    })
      .populate('lead', 'name email avatar')
      .populate('members', 'name email avatar role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
