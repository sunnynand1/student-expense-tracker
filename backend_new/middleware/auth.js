const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token') || req.cookies.token;

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Check if user still exists
    const user = await User.findByPk(decoded.user.id);
    if (!user) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired' });
    }
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
