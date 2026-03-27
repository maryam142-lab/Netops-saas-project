const Package = require('../models/Package');

const listPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    return res.json(packages);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch packages' });
  }
};

const createPackage = async (req, res) => {
  try {
    const { name, speed, price, duration, description } = req.body;

    if (!name || !speed || price === undefined || duration === undefined) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Name, speed, price, and duration are required',
        });
    }

    const pkg = await Package.create({ name, speed, price, duration, description });
    return res.status(201).json(pkg);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create package' });
  }
};

const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, speed, price, duration, description } = req.body;

    const pkg = await Package.findById(id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    if (name !== undefined) pkg.name = name;
    if (speed !== undefined) pkg.speed = speed;
    if (price !== undefined) pkg.price = price;
    if (duration !== undefined) pkg.duration = duration;
    if (description !== undefined) pkg.description = description;

    await pkg.save();
    return res.json(pkg);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update package' });
  }
};

const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findById(id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    await pkg.deleteOne();
    return res.json({ message: 'Package deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete package' });
  }
};

module.exports = { listPackages, createPackage, updatePackage, deletePackage };
