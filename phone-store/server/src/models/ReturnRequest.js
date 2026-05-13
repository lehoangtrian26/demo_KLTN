const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    orderItemId: { type: mongoose.Schema.Types.ObjectId },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    reason: String,
  }],
  reason: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed'],
    default: 'pending',
  },
  refundAmount: { type: Number, default: 0 },
  refundMethod: { type: String, enum: ['bank_transfer', 'cash', 'vnpay'] },
  refundBankInfo: {
    bankName:      { type: String },
    accountNumber: { type: String },
    accountHolder: { type: String },
  },
  refundRef:   { type: String }, // mã giao dịch hoàn tiền
  adminNote:   { type: String },
  resolvedAt:  { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
