const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  storage: { type: String }, // 128GB, 256GB, 512GB
  color: { type: String, required: true },
  colorHex: { type: String }, // #000000
  price: { type: Number, required: true },
  salePrice: { type: Number },
  stock: { type: Number, default: 0, min: 0 },
  sku: { type: String, unique: true, sparse: true },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
  stockWatchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

productVariantSchema.index({ productId: 1 });

module.exports = mongoose.model('ProductVariant', productVariantSchema);
