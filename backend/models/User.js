const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'resolver'],
    default: 'user',
  },
  area: {
    type: String,
    enum: ['IT', 'HR', 'Maintenance', 'Finance'],
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  unblockRequestMessage: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
