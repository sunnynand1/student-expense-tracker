import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const auth = async (req, res, next) => {
  console.log('\n=== Auth Middleware ===');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  try {
    // Log all headers for debugging
    console.log('Request headers:', {
      authorization: req.headers.authorization ? '***present***' : 'missing',
      'content-type': req.headers['content-type'] || 'not set',
      cookie: req.headers.cookie ? '***present***' : 'missing'
    });
    
    // In development, bypass authentication completely
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Development mode: Bypassing authentication');
      // Use test user with ID 1
      req.user = { 
        id: 1, 
        email: 'test@example.com',
        isAdmin: true
      };
      return next();
    }
    
    let token;
    // Check Authorization header first
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('Found token in Authorization header');
    } 
    // Then check cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Found token in cookies');
    }
    
    // Log if no token found
    if (!token) {
      console.log('No token found in request');
      console.log('Request headers:', req.headers);
      console.log('Request cookies:', req.cookies);
    }
    
    if (!token) {
      console.error('❌ No authentication token found in headers or cookies');
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required',
        details: 'No token found in Authorization header or cookies'
      });
    }

    // Verify token
    let decoded;
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
      console.log('Verifying token with secret:', jwtSecret === 'your_jwt_secret' ? 'default' : 'custom');
      
      decoded = jwt.verify(token, jwtSecret);
      console.log('Decoded token:', decoded);
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        console.error('❌ Token expired');
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          details: 'Please log in again'
        });
      }
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          expiredAt: jwtError.expiredAt
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        details: jwtError.message
      });
    }

    // Find user by id from token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      console.error('❌ User not found for token user ID:', decoded.id);
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Check if user is active
    if (!user.is_active) {
      console.error('❌ User account is inactive:', user.id);
      return res.status(401).json({
        success: false,
        error: 'Account is inactive. Please contact support.'
      });
    }

    // Add user to request object
    req.user = user;
    console.log('✅ User authenticated:', user.id);
    
    // Update last login time
    user.last_login = new Date();
    await user.save();
    
    // Add user info to response headers for debugging
    res.set('X-Authenticated-User', user.id);
    
    next();
  } catch (error) {
    console.error('🔥 Auth middleware error:', {
      message: error.message,
      stack: error.stack,
      ...(error.response && { response: error.response.data })
    });
    
    // Handle database errors
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        error: 'Database error during authentication'
      });
    }
    
    // Handle other unexpected errors
    res.status(500).json({ 
      success: false, 
      error: 'Server error during authentication',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default auth;
