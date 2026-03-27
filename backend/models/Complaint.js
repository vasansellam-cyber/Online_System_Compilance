const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true
  },
  solution: {
    type: String,
    default: ''
  },
  area: {
    type: String,
    required: true,
    enum: ['IT', 'HR', 'Maintenance', 'Finance'],
  },
  assignedResolver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
