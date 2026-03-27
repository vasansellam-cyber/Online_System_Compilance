const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

// Helper to check admin
const isAdmin = (req) => req.user && req.user.role === 'admin';

// @route   GET /api/admin/stats
// @desc    Get system-wide stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Not authorized' });

    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalResolvers = await User.countDocuments({ role: 'resolver' });
    
    const complaints = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    let complaintStats = {
      total: 0,
      resolved: 0,
      inProgress: 0,
      pending: 0,
      rejected: 0
    };

    complaints.forEach(c => {
      complaintStats.total += c.count;
      if (c._id === 'Resolved') complaintStats.resolved = c.count;
      else if (c._id === 'In Progress') complaintStats.inProgress = c.count;
      else if (c._id === 'Pending') complaintStats.pending = c.count;
      else if (c._id === 'Rejected') complaintStats.rejected = c.count;
    });

    const unblockRequests = await User.countDocuments({ isBlocked: true, unblockRequestMessage: { $ne: '' } });

    res.json({
      users: totalUsers,
      resolvers: totalResolvers,
      complaints: complaintStats,
      unblockRequests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving admin stats' });
  }
};

// @route   GET /api/admin/users
// @desc    Get all users and resolvers
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Not authorized' });
    
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
      
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

// @route   PATCH /api/admin/users/:id/block
// @desc    Toggle block status of a user
// @access  Private (Admin)
exports.toggleUserBlock = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Not authorized' });
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot block admins' });

    user.isBlocked = !user.isBlocked;
    
    // If they are being unblocked, clear their unblock request message
    if (!user.isBlocked) {
      user.unblockRequestMessage = '';
    }

    await user.save();
    
    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: user.isBlocked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating user status' });
  }
};

// @route   GET /api/admin/complaints
// @desc    Get all complaints in the system
// @access  Private (Admin)
exports.getAllComplaints = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Not authorized' });
    
    const complaints = await Complaint.find()
      .populate('user', 'username email')
      .populate('assignedResolver', 'username role area')
      .sort({ createdAt: -1 });
      
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving complaints' });
  }
};

// @route   PATCH /api/admin/complaints/:id/assign
// @desc    Assign a specific resolver to a complaint
// @access  Private (Admin)
exports.assignComplaintResolver = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Not authorized' });
    
    const { resolverId } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (!resolverId) {
      complaint.assignedResolver = null;
      await complaint.save();
      return res.json({ message: 'Complaint unassigned successfully', complaint });
    }

    const resolver = await User.findById(resolverId);
    if (!resolver || resolver.role !== 'resolver') {
      return res.status(400).json({ message: 'Invalid resolver specified' });
    }

    complaint.assignedResolver = resolver._id;
    complaint.area = resolver.area; // Sync area to the resolver's area
    await complaint.save();
    
    // Send Notification to Resolver
    try {
       const notification = new Notification({
         user: resolver._id,
         message: `You have been assigned a new complaint: "${complaint.subject}"`,
         type: 'warning',
         link: '/resolver-dashboard'
       });
       await notification.save();
    } catch (notifErr) {
       console.error("Failed to notify resolver:", notifErr);
    }

    res.json({ message: `Complaint assigned to ${resolver.username}`, complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating complaint' });
  }
};
