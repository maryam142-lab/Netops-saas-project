const User = require('../models/User');
const Bill = require('../models/Bill');
const AdminSettings = require('../models/AdminSettings');

const listCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password');
    return res.json(customers);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'customer',
      phone,
      address,
    });

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }
    return res.status(500).json({ success: false, message: 'Failed to create customer' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone, address } = req.body;

    const user = await User.findById(id).select('+password');
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && String(existing._id) !== String(user._id)) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      user.email = email;
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (password) user.password = password;

    await user.save();

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update customer' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await user.deleteOne();
    return res.json({ message: 'Customer deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete customer' });
  }
};

const revenueSummary = async (req, res) => {
  try {
    const months = Math.max(1, Math.min(36, Number(req.query.months) || 12));

    const summaries = await Bill.aggregate([
      {
        $group: {
          _id: '$month',
          totalBilled: { $sum: '$amount' },
          totalPaid: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0],
            },
          },
          paidCount: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] },
          },
          unpaidCount: {
            $sum: { $cond: [{ $eq: ['$status', 'unpaid'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: months },
    ]);

    return res.json({ months, summaries });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch revenue summary' });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.findOne();
    if (!settings) {
      const created = await AdminSettings.create({});
      return res.json(created);
    }
    return res.json(settings);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load settings' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const payload = req.body || {};
    const settings = await AdminSettings.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
    });
    return res.json(settings);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

module.exports = {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  revenueSummary,
  getSettings,
  updateSettings,
};
