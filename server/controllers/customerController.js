const Connection = require('../models/Connection');
const Package = require('../models/Package');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const UpgradeRequest = require('../models/UpgradeRequest');
const User = require('../models/User');

const requestConnection = async (req, res) => {
  try {
    const { packageId } = req.body;
    if (!packageId) {
      return res.status(400).json({ success: false, message: 'packageId is required' });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const existing = await Connection.findOne({
      customerId: req.user._id,
      packageId,
      status: { $in: ['pending', 'active'] },
    });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'Connection already pending or active' });
    }

    const connection = await Connection.create({
      customerId: req.user._id,
      packageId,
      status: 'pending',
    });

    return res.status(201).json(connection);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to request connection' });
  }
};

const listConnections = async (req, res) => {
  try {
    const connections = await Connection.find({ customerId: req.user._id }).populate(
      'packageId',
      'name speed price duration'
    );
    return res.json(connections);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch connections' });
  }
};

const listPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    return res.json(packages);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch packages' });
  }
};

const listBills = async (req, res) => {
  try {
    const bills = await Bill.find({ customerId: req.user._id }).sort({ dueDate: -1 });
    return res.json(bills);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch bills' });
  }
};

const listPayments = async (req, res) => {
  try {
    const bills = await Bill.find({ customerId: req.user._id }).select('_id');
    const billIds = bills.map((bill) => bill._id);
    const payments = await Payment.find({ billId: { $in: billIds } }).sort({
      paymentDate: -1,
    });
    return res.json(payments);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch payments' });
  }
};

const getProfile = async (req, res) => {
  return res.json(req.user);
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && String(existing._id) !== String(user._id)) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      user.email = email.toLowerCase();
    }
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'currentPassword and newPassword are required' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const match = await user.comparePassword(currentPassword);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update password' });
  }
};

const upgradeRequest = async (req, res) => {
  try {
    const { packageId } = req.body;
    if (!packageId) {
      return res.status(400).json({ success: false, message: 'packageId is required' });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const connection = await Connection.findOne({
      customerId: req.user._id,
      status: 'active',
    });
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Active connection not found' });
    }

    const existing = await UpgradeRequest.findOne({
      customerId: req.user._id,
      connectionId: connection._id,
      status: 'pending',
    });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'Upgrade request already pending' });
    }

    const request = await UpgradeRequest.create({
      customerId: req.user._id,
      connectionId: connection._id,
      currentPackageId: connection.packageId,
      requestedPackageId: pkg._id,
      status: 'pending',
    });

    return res.status(201).json(request);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to submit upgrade request' });
  }
};

module.exports = {
  requestConnection,
  listConnections,
  listPackages,
  listBills,
  listPayments,
  getProfile,
  updateProfile,
  changePassword,
  upgradeRequest,
};
