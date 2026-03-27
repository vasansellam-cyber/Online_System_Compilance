const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @route   POST /api/complaints
// @desc    Submit a new complaint
// @access  Private
exports.submitComplaint = async (req, res) => {
  try {
    const { subject, summary, priority, area } = req.body;
    
    // Create new complaint linked to user
    const newComplaint = new Complaint({
      user: req.user.id, // from auth middleware
      subject,
      summary,
      area: area || 'General',
      priority: priority || 'Medium',
      status: 'Pending'
    });

    const savedComplaint = await newComplaint.save();
    
    // Notify all admins
    try {
      const admins = await User.find({ role: 'admin' });
      const notifications = admins.map(admin => ({
        user: admin._id,
        message: `New complaint submitted: "${subject}"`,
        type: 'info',
        link: '/admin-dashboard/complaints'
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {
      console.error('Failed to send admin notifications:', notifErr);
    }
    
    res.status(201).json({ 
      message: 'Complaint submitted successfully', 
      complaint: savedComplaint 
    });
  } catch (error) {
    console.error("Error submitting complaint:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/complaints
// @desc    Get all complaints for the logged in user
// @access  Private
exports.getUserComplaints = async (req, res) => {
  try {
    // find complaints sorted by newest first
    const complaints = await Complaint.find({ user: req.user.id })
        .populate('assignedResolver', 'username')
        .sort({ createdAt: -1 });
    
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error.message);
    res.status(500).json({ popupMsg: 'Server error' });
  }
};

// @route   GET /api/complaints/stats
// @desc    Get counts of complaints for logged in user
// @access  Private
exports.getComplaintStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments({ user: req.user.id });
    const resolved = await Complaint.countDocuments({ user: req.user.id, status: 'Resolved' });
    const inProgress = await Complaint.countDocuments({ user: req.user.id, status: 'In Progress' });
    const pending = await Complaint.countDocuments({ user: req.user.id, status: 'Pending' });

    res.json({
      total,
      resolved,
      inProgress,
      pending
    });
  } catch (error) {
    console.error("Error fetching complaint stats:", error.message);
    res.status(500).json({ message: 'Server error retrieving stats' });
  }
};

// @route   GET /api/complaints/resolver
// @desc    Get all complaints for the resolver's area
// @access  Private (Resolver only)
exports.getResolverComplaints = async (req, res) => {
  try {
    if (req.user.role !== 'resolver') {
      return res.status(403).json({ message: 'Not authorized for this action' });
    }
    const complaints = await Complaint.find({ area: req.user.area })
        .populate('user', 'username email')
        .populate('assignedResolver', 'username')
        .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching resolver complaints:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/complaints/resolver/stats
// @desc    Get stats for the resolver's area
// @access  Private (Resolver only)
exports.getResolverStats = async (req, res) => {
  try {
    if (req.user.role !== 'resolver') {
      return res.status(403).json({ message: 'Not authorized for this action' });
    }
    const total = await Complaint.countDocuments({ area: req.user.area });
    const resolved = await Complaint.countDocuments({ area: req.user.area, status: 'Resolved' });
    const inProgress = await Complaint.countDocuments({ area: req.user.area, status: 'In Progress' });
    const pending = await Complaint.countDocuments({ area: req.user.area, status: 'Pending' });

    res.json({ total, resolved, inProgress, pending });
  } catch (error) {
    console.error("Error fetching resolver stats:", error.message);
    res.status(500).json({ message: 'Server error retrieving stats' });
  }
};

// @route   PATCH /api/complaints/:id/status
// @desc    Update complaint status
// @access  Private (Resolver/Admin)
exports.updateComplaintStatus = async (req, res) => {
  try {
    if (req.user.role !== 'resolver' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized for this action' });
    }
    const { status } = req.body;
    
    // Validate status
    if (!['Pending', 'In Progress', 'Resolved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Make sure resolver can only resolve their area
    if (req.user.role === 'resolver' && complaint.area !== req.user.area) {
        return res.status(403).json({ message: 'Not authorized to update this complaint' });
    }

    complaint.status = status;
    
    // Auto-assign to acting resolver if not assigned
    if (req.user.role === 'resolver' && !complaint.assignedResolver) {
       complaint.assignedResolver = req.user.id;
    }

    if (req.body.solution) {
       complaint.solution = req.body.solution;
    }

    await complaint.save();

    // Create notification for the user who issued the complaint
    if (status === 'Resolved') {
      try {
         const notification = new Notification({
           user: complaint.user,
           message: `Your complaint "${complaint.subject}" has been Resolved.`,
           type: 'success',
           link: '/user-dashboard/complaints'
         });
         await notification.save();
      } catch (notifErr) {
         console.error('Failed to notify user:', notifErr);
      }
    }

    res.json({ message: 'Complaint status updated', complaint });
  } catch (error) {
    console.error("Error updating complaint status:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
