const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    default: null
  },
  issueKey: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['epic', 'story', 'task', 'bug', 'subtask'],
    default: 'task'
  },
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['backlog', 'todo', 'inprogress', 'inreview', 'done'],
    default: 'backlog'
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  labels: [{
    type: String,
    trim: true
  }],
  storyPoints: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Auto-generate issueKey before saving
issueSchema.pre('save', async function(next) {
  if (this.isNew && !this.issueKey) {
    const Project = mongoose.model('Project');
    const project = await Project.findById(this.project);
    const count = await mongoose.model('Issue').countDocuments({ project: this.project });
    this.issueKey = `${project.key}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Issue', issueSchema);
