const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    images: [{ type: String }],
    specs: {
      display: String,
      chip: String,
      ram: String,
      storage: [String],
      battery: String,
      camera: String,
      os: String,
    },
    colors: [{ type: String }],
    badge: { type: String, enum: ['New', 'Hot', 'Sale', 'Best Seller'] },
    inStock: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    description: { type: String },
  },
  { timestamps: true }
);

phoneSchema.index({ brand: 1, price: 1 });

module.exports = mongoose.model('Phone', phoneSchema);
