const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Protect routes - verify token and attach user
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header (format: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token and exclude password field
      req.user = await User.findById(decoded.id).select('+role');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      return next();
    } catch (error) {
      console.error('JWT verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Check if user is Admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Not authorized as an admin' });
};

module.exports = { protect, admin };
