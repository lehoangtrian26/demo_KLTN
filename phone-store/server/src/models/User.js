const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  password: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin', 'staff'], default: 'user' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  // Loyalty
  memberTier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  totalSpent: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  birthday: { type: Date },
  // Address
  addresses: [{
    label: String,
    fullName: String,
    phone: String,
    address: String,
    city: String,
    district: String,
    isDefault: { type: Boolean, default: false },
  }],
  lastLoginAt: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
