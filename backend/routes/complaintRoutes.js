const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/complaints
// @desc    Submit a new complaint
// @access  Private
router.post('/', auth, complaintController.submitComplaint);

// @route   GET /api/complaints/stats
// @desc    Get complaints dashboard stats
// @access  Private
router.get('/stats', auth, complaintController.getComplaintStats);

// @route   GET /api/complaints
// @desc    Get all user's complaints
// @access  Private
router.get('/', auth, complaintController.getUserComplaints);

// @route   GET /api/complaints/resolver
// @desc    Get all complaints for the resolver's area
// @access  Private
router.get('/resolver', auth, complaintController.getResolverComplaints);

// @route   GET /api/complaints/resolver/stats
// @desc    Get complaints dashboard stats for the resolver's area
// @access  Private
router.get('/resolver/stats', auth, complaintController.getResolverStats);

// @route   PATCH /api/complaints/:id/status
// @desc    Update complaint status
// @access  Private
router.patch('/:id/status', auth, complaintController.updateComplaintStatus);

module.exports = router;
