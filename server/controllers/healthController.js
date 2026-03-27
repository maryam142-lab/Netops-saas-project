const healthCheck = (req, res) => {
  try {
    res.json({ status: 'NetOps API running' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Health check failed' });
  }
};

module.exports = { healthCheck };
