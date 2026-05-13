const { Order, Cart, ProductVariant, StockLog, User, WalletTransaction } = require('../models/index');
const { success, error } = require('../utils/response.utils');

// POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'cod', note, couponCode } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.variantId', 'color storage stock price salePrice')
      .populate('items.productId', 'name images isActive');

    if (!cart || !cart.items.length) return error(res, 'Giỏ hàng trống', 400);

    // Kiểm tra stock — sau populate, item.variantId là document
    const stockErrors = [];
    for (const item of cart.items) {
      const variant = item.variantId;
      const product = item.productId;
      if (!variant || !product || !product.isActive) {
        stockErrors.push(`Sản phẩm "${product?.name || 'không xác định'}" không còn tồn tại`);
        continue;
      }
      if (variant.stock < item.quantity) {
        stockErrors.push(`"${product.name}" chỉ còn ${variant.stock} sản phẩm`);
      }
    }
    if (stockErrors.length) {
      return res.status(400).json({ success: false, message: stockErrors[0], errors: stockErrors });
    }

    // Tính tiền
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingFee = subtotal >= 5000000 ? 0 : 30000;
    const discountAmount = cart.discountAmount || 0;
    const totalPrice = subtotal + shippingFee - discountAmount;

    // Kiểm tra số dư ví nếu thanh toán bằng ví
    if (paymentMethod === 'wallet') {
      const u = await User.findById(req.user._id).select('walletBalance').lean();
      const balance = u?.walletBalance || 0;
      if (balance < totalPrice) {
        return error(res,
          `Số dư ví không đủ. Số dư hiện tại: ${balance.toLocaleString('vi-VN')}đ, cần thanh toán: ${totalPrice.toLocaleString('vi-VN')}đ`,
          400);
      }
    }

    // Map items — dùng _id từ populated documents
    const orderItems = cart.items.map((i) => ({
      productId: i.productId._id,
      variantId: i.variantId._id,
      name: i.productId.name,
      image: i.productId.images?.[0] || '',
      color: i.variantId.color,
      storage: i.variantId.storage,
      price: i.price,
      quantity: i.quantity,
    }));

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'wallet' ? 'paid' : 'pending',
      subtotal,
      shippingFee,
      discountAmount,
      totalPrice,
      couponCode,
      note,
    });

    // Trừ stock + ghi StockLog song song
    await Promise.all([
      ...cart.items.map((item) =>
        ProductVariant.findByIdAndUpdate(item.variantId._id, { $inc: { stock: -item.quantity } })
      ),
      ...cart.items.map((item) =>
        StockLog.create({
          variantId: item.variantId._id,
          productId: item.productId._id,
          type: 'sell',
          quantity: -item.quantity,
          note: `Đơn hàng ${order.orderCode}`,
          orderId: order._id,
        })
      ),
    ]);

    // Xóa giỏ hàng
    await Cart.findByIdAndUpdate(cart._id, { items: [], discountAmount: 0, couponCode: null });

    // Thanh toán bằng ví: trừ số dư + ghi giao dịch
    if (paymentMethod === 'wallet') {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { walletBalance: -totalPrice } },
        { new: true }
      ).select('walletBalance');
      await WalletTransaction.create({
        userId: req.user._id,
        type: 'payment',
        amount: -totalPrice,
        balanceAfter: updatedUser.walletBalance,
        orderId: order._id,
        description: `Thanh toán đơn ${order.orderCode}`,
      });
    }

    return success(res, { data: order }, 'Đặt hàng thành công', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
    ]);

    return res.json({
      success: true,
      data: orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!order) return error(res, 'Không tìm thấy đơn hàng', 404);
    return success(res, { data: order });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/cancel
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return error(res, 'Không tìm thấy đơn hàng', 404);
    if (!['pending', 'confirmed'].includes(order.status)) {
      return error(res, 'Không thể hủy đơn hàng ở trạng thái này', 400);
    }

    order.status = 'cancelled';
    order.cancelReason = req.body.reason || 'Khách hàng hủy';

    // Nếu đã thanh toán bằng ví → hoàn tiền vào ví ngay
    if (order.paymentMethod === 'wallet' && order.paymentStatus === 'paid') {
      const updatedUser = await User.findByIdAndUpdate(
        order.userId,
        { $inc: { walletBalance: order.totalPrice } },
        { new: true }
      ).select('walletBalance');
      await WalletTransaction.create({
        userId: order.userId,
        type: 'refund',
        amount: order.totalPrice,
        balanceAfter: updatedUser.walletBalance,
        orderId: order._id,
        description: `Hoàn tiền hủy đơn ${order.orderCode}`,
      });
      order.paymentStatus = 'refunded';
    }

    await order.save();

    // Hoàn stock + ghi log song song
    await Promise.all([
      ...order.items.map((item) =>
        ProductVariant.findByIdAndUpdate(item.variantId, { $inc: { stock: item.quantity } })
      ),
      ...order.items.map((item) =>
        StockLog.create({
          variantId: item.variantId,
          productId: item.productId,
          type: 'return',
          quantity: item.quantity,
          note: `Hủy đơn ${order.orderCode}`,
          orderId: order._id,
        })
      ),
    ]);

    return success(res, { data: order }, 'Đã hủy đơn hàng');
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder };
