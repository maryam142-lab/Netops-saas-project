const jwt = require('jsonwebtoken');

const signToken = (user) => {
  const payload = {
    userId: user._id,
    role: user.role,
    tenantId: user.tenantId || '',
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = { signToken };
