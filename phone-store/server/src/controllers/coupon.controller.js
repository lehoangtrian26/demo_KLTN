const { Coupon, Cart } = require('../models/index');
const { success, error } = require('../utils/response.utils');

// POST /api/coupons/validate
const validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return error(res, 'Vui lòng nhập mã giảm giá', 400);

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return error(res, 'Mã giảm giá không tồn tại', 404);

    const now = new Date();
    if (now < coupon.startDate) return error(res, 'Mã giảm giá chưa có hiệu lực', 400);
    if (now > coupon.endDate) return error(res, 'Mã giảm giá đã hết hạn', 400);
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return error(res, 'Mã giảm giá đã hết lượt sử dụng', 400);
    }
    if (cartTotal < coupon.minOrderValue) {
      return error(res, `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ để dùng mã này`, 400);
    }

    // Kiểm tra loại user
    if (coupon.userType !== 'all') {
      const userTier = req.user.memberTier || 'bronze';
      if (coupon.userType !== userTier) {
        return error(res, `Mã này chỉ dành cho thành viên ${coupon.userType}`, 400);
      }
    }

    // Tính discount
    let discountAmount = coupon.type === 'percent'
      ? Math.round((cartTotal * coupon.value) / 100)
      : coupon.value;

    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }

    return success(res, {
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
        description: coupon.description,
      },
    }, `Áp dụng thành công — giảm ${discountAmount.toLocaleString('vi-VN')}đ`);
  } catch (err) { next(err); }
};

// GET /api/coupons — danh sách coupon public (đang active)
const getActiveCoupons = async (req, res, next) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
      $or: [{ userType: 'all' }, { userType: req.user?.memberTier || 'bronze' }],
    })
      .select('code type value description minOrderValue maxDiscountAmount endDate userType')
      .sort({ value: -1 })
      .limit(20)
      .lean();
    return success(res, { data: coupons });
  } catch (err) { next(err); }
};

module.exports = { validateCoupon, getActiveCoupons };
