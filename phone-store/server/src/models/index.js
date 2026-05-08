const User = require('./User');
const OTP = require('./OTP');
const Category = require('./Category');
const Brand = require('./Brand');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const { Cart, CartItem } = require('./Cart');
const { Order, OrderItem } = require('./Order');
const Payment = require('./Payment');
const Review = require('./Review');
const Wishlist = require('./Wishlist');
const Coupon = require('./Coupon');
const ReturnRequest = require('./ReturnRequest');
const Warranty = require('./Warranty');
const Notification = require('./Notification');
const StockLog = require('./StockLog');
const FlashSale = require('./FlashSale');
const { ChatSession, ChatMessage } = require('./ChatSession');
const AuditLog = require('./AuditLog');

module.exports = {
  User, OTP, Category, Brand,
  Product, ProductVariant,
  Cart, CartItem,
  Order, OrderItem,
  Payment, Review, Wishlist, Coupon,
  ReturnRequest, Warranty, Notification,
  StockLog, FlashSale,
  ChatSession, ChatMessage,
  AuditLog,
};
