const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  phone: { type: mongoose.Schema.Types.ObjectId, ref: 'Phone', required: true },
  name: String,
  image: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  color: String,
  storage: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
    },
    paymentMethod: { type: String, enum: ['cod', 'bank'], default: 'cod' },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },
    note: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
