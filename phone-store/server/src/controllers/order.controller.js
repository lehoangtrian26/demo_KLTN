const { Order, Cart, ProductVariant, StockLog } = require('../models/index');
const { success, error } = require('../utils/response.utils');

// POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'cod', note, couponCode } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.variantId')
      .populate('items.productId', 'name images');

    if (!cart || !cart.items.length) return error(res, 'Giỏ hàng trống', 400);

    // Kiểm tra tất cả items còn hàng
    const stockErrors = [];
    for (const item of cart.items) {
      if (!item.variantId || item.variantId.stock < item.quantity) {
        stockErrors.push(`${item.productId?.name || 'Sản phẩm'} không đủ hàng`);
      }
    }
    if (stockErrors.length) return res.status(400).json({ success: false, message: stockErrors[0], errors: stockErrors });

    // Tính tiền
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingFee = subtotal >= 5000000 ? 0 : 30000;
    const discountAmount = cart.discountAmount || 0;
    const totalPrice = subtotal + shippingFee - discountAmount;

    // Tạo order
    const items = cart.items.map((i) => ({
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
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      discountAmount,
      totalPrice,
      couponCode,
      note,
    });

    // Trừ stock + ghi StockLog
    const stockOps = cart.items.map((item) =>
      ProductVariant.findByIdAndUpdate(item.variantId._id, { $inc: { stock: -item.quantity } })
    );
    const logOps = cart.items.map((item) =>
      StockLog.create({
        variantId: item.variantId._id,
        productId: item.productId._id,
        type: 'sell',
        quantity: -item.quantity,
        note: `Đơn hàng ${order.orderCode}`,
        orderId: order._id,
      })
    );
    await Promise.all([...stockOps, ...logOps]);

    // Xóa giỏ hàng
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [], discountAmount: 0, couponCode: null });

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

    return res.json({ success: true, data: orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
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
    await order.save();

    // Hoàn stock
    const stockOps = order.items.map((item) =>
      ProductVariant.findByIdAndUpdate(item.variantId, { $inc: { stock: item.quantity } })
    );
    const logOps = order.items.map((item) =>
      StockLog.create({
        variantId: item.variantId,
        productId: item.productId,
        type: 'return',
        quantity: item.quantity,
        note: `Hủy đơn ${order.orderCode}`,
        orderId: order._id,
      })
    );
    await Promise.all([...stockOps, ...logOps]);

    return success(res, { data: order }, 'Đã hủy đơn hàng');
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder };
