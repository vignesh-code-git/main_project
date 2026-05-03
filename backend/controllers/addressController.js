const { Address } = require('../models/associations');

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { title, addressLine, city, state, zipCode, country, isDefault, phoneNumber } = req.body;

    // If setting as default, unset other defaults for this user
    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
    }

    const address = await Address.create({
      userId: req.user.id,
      title,
      addressLine,
      city,
      state,
      zipCode,
      phoneNumber,
      country,
      isDefault
    });

    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { title, addressLine, city, state, zipCode, country, isDefault, phoneNumber } = req.body;
    const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!address) return res.status(404).json({ message: 'Address not found' });

    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
    }

    address.title = title || address.title;
    address.addressLine = addressLine || address.addressLine;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    if (phoneNumber !== undefined) address.phoneNumber = phoneNumber;
    address.country = country || address.country;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await address.save();
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    await address.destroy();
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
