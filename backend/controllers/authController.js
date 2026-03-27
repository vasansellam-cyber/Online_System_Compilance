const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @route   POST /api/auth/register
// @desc    Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, role, area } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide username, email, password and role' });
    }
    
    if (role === 'resolver' && !area) {
      return res.status(400).json({ message: 'Please provide an area for the resolver role' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      ...(role === 'resolver' && { area }),
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password and role' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ 
        message: 'Your account has been blocked.', 
        errorCode: 'USER_BLOCKED',
        email: user.email 
      });
    }

    // Validate role
    if (user.role !== role) {
      return res.status(400).json({ message: 'Invalid Role for this user' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        area: user.area,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: {
            role: user.role, 
            email: user.email,
            area: user.area
          }
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/auth/users
// @desc    Get all registered users (MOCK GOOGLE ACCOUNT CHOOSER FEATURE)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('email username role area -_id');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// @route   POST /api/auth/mock-google-login
// @desc    Mock login bypassing password
exports.mockGoogleLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Account not found. Please register first.' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ 
        message: 'Your account has been blocked.', 
        errorCode: 'USER_BLOCKED',
        email: user.email 
      });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        area: user.area,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: {
            role: user.role, 
            email: user.email,
            area: user.area
          }
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/auth/request-unblock
// @desc    Submit a request message to unblock an account
exports.requestUnblock = async (req, res) => {
  try {
    const { email, message } = req.body;
    
    if (!email || !message) {
       return res.status(400).json({ message: 'Email and message are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
       return res.status(404).json({ message: 'Account not found' });
    }
    
    if (!user.isBlocked) {
       return res.status(400).json({ message: 'This account is not blocked' });
    }
    
    user.unblockRequestMessage = message;
    await user.save();
    
    res.json({ message: 'Unblock request submitted successfully. An admin will review it.' });
  } catch (error) {
    console.error("Error submitting unblock request:", error);
    res.status(500).json({ message: 'Server error while submitting request' });
  }
};
