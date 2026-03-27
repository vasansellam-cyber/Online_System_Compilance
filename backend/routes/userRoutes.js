const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.put('/profile-picture', auth, userController.updateProfilePicture);
router.put('/password', auth, userController.updatePassword);

module.exports = router;
