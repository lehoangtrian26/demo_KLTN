const Order = require('../models/Order');

const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, totalPrice, note } = req.body;
  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod,
    totalPrice,
    note,
  });
  res.status(201).json(order);
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('items.phone', 'name images');
  res.json(orders);
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.phone', 'name images');
  if (!order || order.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  }
  res.json(order);
};

module.exports = { createOrder, getMyOrders, getOrderById };
