const Connection = require('../models/Connection');
const { generateBillForConnection } = require('../services/billingService');

const listPendingConnections = async (req, res) => {
  try {
    const connections = await Connection.find({ status: 'pending' })
      .populate('customerId', 'name email phone address')
      .populate('packageId', 'name speed price duration');
    return res.json(connections);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch pending connections' });
  }
};

const approveConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await Connection.findById(id);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    if (connection.status !== 'pending') {
      return res
        .status(400)
        .json({ success: false, message: 'Connection is not pending' });
    }

    connection.status = 'active';
    if (!connection.installDate) {
      connection.installDate = new Date();
    }

    await connection.save();

    const billingResult = await generateBillForConnection(connection._id, new Date());
    return res.json({
      success: true,
      message: 'Connection approved and current month bill generated',
      connection,
      billing: billingResult,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to approve connection' });
  }
};

const rejectConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await Connection.findById(id);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    if (connection.status !== 'pending') {
      return res
        .status(400)
        .json({ success: false, message: 'Connection is not pending' });
    }

    connection.status = 'suspended';
    await connection.save();
    return res.json(connection);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to reject connection' });
  }
};

module.exports = { listPendingConnections, approveConnection, rejectConnection };
