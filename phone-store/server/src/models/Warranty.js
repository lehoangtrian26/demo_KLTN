const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
  imei: { type: String },
  serial: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  warrantyMonths: { type: Number, required: true },
  status: { type: String, enum: ['active', 'expired', 'voided'], default: 'active' },
  claims: [{
    claimDate: Date,
    description: String,
    result: String,
    resolvedAt: Date,
  }],
}, { timestamps: true });

warrantySchema.index({ imei: 1 });

module.exports = mongoose.model('Warranty', warrantySchema);
