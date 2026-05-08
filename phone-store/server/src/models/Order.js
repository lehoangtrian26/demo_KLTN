const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  name: String,
  image: String,
  storage: String,
  color: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderCode: { type: String, unique: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    district: String,
  },
  shippingFee: { type: Number, default: 0 },
  shippingPartner: { type: String, enum: ['GHN', 'GHTK', 'ViettelPost', 'store_pickup'], default: 'GHN' },
  trackingCode: { type: String },
  paymentMethod: { type: String, enum: ['cod', 'bank_transfer', 'momo', 'zalopay', 'vnpay'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  couponCode: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled', 'return_requested', 'returned'],
    default: 'pending',
  },
  autoExpiry: { type: Date }, // tự hủy nếu chưa confirm
  note: { type: String },
  cancelReason: { type: String },
  deliveredAt: { type: Date },
}, { timestamps: true });

orderSchema.pre('save', function (next) {
  if (!this.orderCode) {
    this.orderCode = 'ORD' + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();
  }
  if (!this.autoExpiry) {
    this.autoExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 phút
  }
  next();
});

orderSchema.index({ userId: 1, status: 1 });

module.exports = {
  Order: mongoose.model('Order', orderSchema),
  OrderItem: mongoose.model('OrderItem', orderItemSchema),
};
