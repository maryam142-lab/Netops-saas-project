const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : null;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
};

const isCustomer = (req, res, next) => {
  if (req.user?.role !== 'customer') {
    return res.status(403).json({ message: 'Customer access required' });
  }
  return next();
};

module.exports = { protect, isAdmin, isCustomer };
