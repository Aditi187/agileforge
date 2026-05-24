const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
    // e.g. 'created_issue', 'updated_status', 'added_comment', 'started_sprint', etc.
  },
  details: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
