const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String },
  type: { type: String, enum: ['percent', 'fixed'], required: true },
  value: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
  userUsageLimit: { type: Number, default: 1 },
  applicableBrands: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  userType: { type: String, enum: ['all', 'new', 'bronze', 'silver', 'gold', 'platinum'], default: 'all' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
