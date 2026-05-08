const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  originalPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sold: { type: Number, default: 0 },
  limitPerUser: { type: Number, default: 1 },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

flashSaleSchema.index({ startTime: 1, endTime: 1, isActive: 1 });

module.exports = mongoose.model('FlashSale', flashSaleSchema);
