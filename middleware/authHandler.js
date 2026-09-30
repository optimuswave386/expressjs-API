// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Make sure to use dotenv if using .env file
const User = require('../models/user.js');

module.exports = function verifyToken(req, res, next) {
  
  // Get token from header (Authorization: Bearer <token>)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token part

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // expose the verified token payload to route handlers
    // compare email from payload to request object for further use
    if(req.params.email && req.params.email !== decoded.email) {
      return res.status(403).json({ message: 'Token email does not match request email' });
    }
    next(); // Continue to the next middleware or route handler
  } catch (err) {
    res.status(403).json({ message: 'Token is not valid' });
  }

};

// Use AFTER verifyToken: router.get('/x', verifyToken, verifyToken.requireAdmin, handler)
// Checks the database (not the token) so demoting an admin takes effect immediately.
module.exports.requireAdmin = async function requireAdmin(req, res, next) {
  try {
    const user = await User.findOne({ email: req.user.email }).select('is_admin').exec();
    if (!user || !user.is_admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Error verifying admin status' });
  }
};
