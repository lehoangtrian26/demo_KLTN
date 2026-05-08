const express = require('express');
const router = express.Router();
const Phone = require('../models/Phone');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.use(protect, admin);

router.post('/phones', async (req, res) => {
  const phone = await Phone.create(req.body);
  res.status(201).json(phone);
});

router.put('/phones/:id', async (req, res) => {
  const phone = await Phone.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!phone) return res.status(404).json({ message: 'Không tìm thấy' });
  res.json(phone);
});

router.delete('/phones/:id', async (req, res) => {
  await Phone.findByIdAndDelete(req.params.id);
  res.json({ message: 'Đã xóa' });
});

router.get('/orders', async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

router.put('/orders/:id/status', async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(order);
});

module.exports = router;
