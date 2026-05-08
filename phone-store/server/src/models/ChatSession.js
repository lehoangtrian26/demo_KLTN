const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  tokens: { type: Number },
}, { timestamps: true });

const chatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, required: true, unique: true },
  messages: [chatMessageSchema],
  isActive: { type: Boolean, default: true },
  metadata: {
    userAgent: String,
    ip: String,
  },
}, { timestamps: true });

module.exports = {
  ChatSession: mongoose.model('ChatSession', chatSessionSchema),
  ChatMessage: mongoose.model('ChatMessage', chatMessageSchema),
};
