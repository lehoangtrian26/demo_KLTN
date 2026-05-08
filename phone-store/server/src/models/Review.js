const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
  images: [{ type: String }],
  isVerifiedPurchase: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  likes: { type: Number, default: 0 },
  reply: {
    content: String,
    repliedAt: Date,
  },
}, { timestamps: true });

reviewSchema.index({ productId: 1, rating: -1 });
reviewSchema.index({ userId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
