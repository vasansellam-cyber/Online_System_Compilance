const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');

router.get('/stats', auth, adminController.getDashboardStats);
router.get('/users', auth, adminController.getAllUsers);
router.patch('/users/:id/block', auth, adminController.toggleUserBlock);

router.get('/complaints', auth, adminController.getAllComplaints);
router.patch('/complaints/:id/assign', auth, adminController.assignComplaintResolver);

module.exports = router;
