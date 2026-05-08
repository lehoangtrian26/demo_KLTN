const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // CREATE, UPDATE, DELETE, LOGIN, etc.
  targetModel: { type: String, required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  changes: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
  note: { type: String },
}, { timestamps: true });

auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ targetModel: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
