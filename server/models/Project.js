const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: 100
  },
  key: {
    type: String,
    required: [true, 'Project key is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 10
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  category: {
    type: String,
    enum: ['software', 'marketing', 'design', 'operations', 'hr'],
    default: 'software'
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'on_hold'],
    default: 'active'
  },
  color: {
    type: String,
    default: '#6366f1'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
