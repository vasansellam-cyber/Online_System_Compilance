const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @route   PUT /api/users/profile-picture
// @desc    Update user profile picture (base64 string)
// @access  Private
exports.updateProfilePicture = async (req, res) => {
  try {
    const { profilePicture } = req.body;
    
    if (!profilePicture) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { profilePicture },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile picture updated successfully', user });
  } catch (error) {
    console.error("Error updating profile picture:", error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @route   PUT /api/users/password
// @desc    Update user password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error("Error updating password:", error.message);
    res.status(500).json({ message: 'Server error updating password' });
  }
};
