const cron = require('node-cron');
const { Cart } = require('../models/index');

// Chạy mỗi phút — tìm CartItems có holdExpiry đã hết hạn và xóa hold
const startStockReleaseJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Xóa holdExpiry đã hết hạn trên tất cả cart items
      const result = await Cart.updateMany(
        { 'items.holdExpiry': { $lt: now } },
        { $unset: { 'items.$[expired].holdExpiry': '' } },
        { arrayFilters: [{ 'expired.holdExpiry': { $lt: now } }] }
      );

      if (result.modifiedCount > 0) {
        console.log(`[StockRelease] Giải phóng hold cho ${result.modifiedCount} giỏ hàng`);
      }
    } catch (err) {
      console.error('[StockRelease] Lỗi cron job:', err.message);
    }
  });

  console.log('[StockRelease] Cron job khởi động — chạy mỗi phút');
};

module.exports = { startStockReleaseJob };
