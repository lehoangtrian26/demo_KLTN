const { User, Product, ProductVariant, Order, Brand, Category, Coupon, Review, ReturnRequest, Payment, WalletTransaction, TopupRequest, WithdrawalRequest } = require('../models/index');
const { success, error, paginate } = require('../utils/response.utils');
const { getCheapestVariantMap, attachCheapestVariant } = require('../utils/variant.utils');

const slugify = (str) => str
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/đ/gi, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers, totalProducts, totalOrders,
      monthOrders, lastMonthOrders,
      pendingOrders, recentOrders,
      topProducts,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      ]),
      Order.countDocuments({ status: 'pending' }),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Product.find({ isActive: true }).sort({ sold: -1 }).limit(5).select('name images sold rating').lean(),
    ]);

    const thisMonth = monthOrders[0] || { revenue: 0, count: 0 };
    const lastMonth = lastMonthOrders[0] || { revenue: 0, count: 0 };
    const revenueGrowth = lastMonth.revenue
      ? Math.round(((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100)
      : 0;

    // Doanh thu 7 ngày gần nhất
    const last7Days = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    return success(res, {
      data: {
        stats: { totalUsers, totalProducts, totalOrders, pendingOrders },
        thisMonth: { revenue: thisMonth.revenue, orders: thisMonth.count },
        lastMonth: { revenue: lastMonth.revenue, orders: lastMonth.count },
        revenueGrowth,
        last7Days,
        recentOrders,
        topProducts,
      },
    });
  } catch (err) { next(err); }
};

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q, brand, status } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (brand) filter.brandId = brand;
    if (status) filter.status = status;

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .populate('brandId', 'name')
        .populate('categoryId', 'name_vi')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
    ]);

    const ids = products.map((p) => p._id);
    const variants = await ProductVariant.find({ productId: { $in: ids } }).lean();
    const variantsByProduct = {};
    variants.forEach((v) => {
      if (!variantsByProduct[v.productId]) variantsByProduct[v.productId] = [];
      variantsByProduct[v.productId].push(v);
    });

    const result = products.map((p) => ({
      ...p,
      variants: variantsByProduct[p._id.toString()] || [],
      totalStock: (variantsByProduct[p._id.toString()] || []).reduce((s, v) => s + v.stock, 0),
    }));

    return paginate(res, result, total, page, limit);
  } catch (err) { next(err); }
};

const createProduct = async (req, res, next) => {
  try {
    const { variants, ...productData } = req.body;
    const product = await Product.create(productData);
    if (variants?.length) {
      await ProductVariant.insertMany(variants.map((v) => ({ ...v, productId: product._id })));
    }
    return success(res, { data: product }, 'Tạo sản phẩm thành công', 201);
  } catch (err) { next(err); }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return error(res, 'Không tìm thấy sản phẩm', 404);
    return success(res, { data: product }, 'Cập nhật sản phẩm thành công');
  } catch (err) { next(err); }
};

const deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    return success(res, {}, 'Đã ẩn sản phẩm');
  } catch (err) { next(err); }
};

const updateVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findByIdAndUpdate(req.params.variantId, req.body, { new: true });
    if (!variant) return error(res, 'Không tìm thấy variant', 404);
    return success(res, { data: variant }, 'Cập nhật variant thành công');
  } catch (err) { next(err); }
};

const createVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.create({ ...req.body, productId: req.params.id });
    return success(res, { data: variant }, 'Thêm biến thể thành công', 201);
  } catch (err) { next(err); }
};

const deleteVariant = async (req, res, next) => {
  try {
    await ProductVariant.findByIdAndDelete(req.params.variantId);
    return success(res, {}, 'Xóa biến thể thành công');
  } catch (err) { next(err); }
};

// ── PRODUCT IMAGE UPLOAD ───────────────────────────────────────────────────────
const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'Không có file ảnh', 400);
    return success(res, { data: { url: `/uploads/products/${req.file.filename}` } }, 'Upload ảnh thành công');
  } catch (err) { next(err); }
};

// ── CSV EXPORT ────────────────────────────────────────────────────────────────
const exportProductsCsv = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('brandId', 'name').populate('categoryId', 'name_vi').lean();
    const variantDocs = await ProductVariant.find({ productId: { $in: products.map((p) => p._id) } }).lean();
    const varMap = {};
    variantDocs.forEach((v) => { if (!varMap[v.productId]) varMap[v.productId] = []; varMap[v.productId].push(v); });

    const headers = 'product_name,brand,category,status,badge,warrantyMonths,storage,color,colorHex,price,salePrice,stock,sku';
    const rows = [headers];
    for (const p of products) {
      const pvs = varMap[p._id.toString()] || [];
      const base = [`"${p.name.replace(/"/g, '""')}"`, p.brandId?.name || '', p.categoryId?.name_vi || '', p.status, p.badge || '', p.warrantyMonths];
      if (pvs.length === 0) {
        rows.push([...base, '', '', '', '', '', 0, ''].join(','));
      } else {
        for (const v of pvs) {
          rows.push([...base, v.storage || '', `"${(v.color || '').replace(/"/g, '""')}"`, v.colorHex || '', v.price, v.salePrice || '', v.stock, v.sku || ''].join(','));
        }
      }
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="products_export.csv"');
    res.send('﻿' + rows.join('\n'));
  } catch (err) { next(err); }
};

// ── CSV IMPORT ────────────────────────────────────────────────────────────────
const importProductsCsv = async (req, res, next) => {
  try {
    const { csvText } = req.body;
    if (!csvText?.trim()) return error(res, 'Không có dữ liệu CSV', 400);

    const [brands, categories] = await Promise.all([Brand.find().lean(), Category.find({ isActive: true }).lean()]);
    const brandMap = Object.fromEntries(brands.map((b) => [b.name.toLowerCase(), b._id]));
    const catMap = Object.fromEntries(categories.map((c) => [c.name_vi.toLowerCase(), c._id]));

    const parseRow = (line) => {
      const values = [];
      let cur = '', inQ = false;
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ; }
        else if (ch === ',' && !inQ) { values.push(cur.trim()); cur = ''; }
        else cur += ch;
      }
      values.push(cur.trim());
      return values;
    };

    const lines = csvText.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return error(res, 'File CSV không có dữ liệu', 400);

    const headers = parseRow(lines[0]).map((h) => h.replace(/"/g, '').trim());
    const idx = (h) => headers.indexOf(h);

    let importedVariants = 0;
    const importErrors = [];
    const productCache = {};

    for (let i = 1; i < lines.length; i++) {
      const vals = parseRow(lines[i]);
      const g = (h) => (vals[idx(h)] || '').replace(/"/g, '').trim();
      const productName = g('product_name');
      if (!productName) continue;

      const brandId = brandMap[g('brand').toLowerCase()];
      const categoryId = catMap[g('category').toLowerCase()];
      if (!brandId) { importErrors.push(`Dòng ${i + 1}: Brand "${g('brand')}" không tồn tại`); continue; }
      if (!categoryId) { importErrors.push(`Dòng ${i + 1}: Category "${g('category')}" không tồn tại`); continue; }

      let product = productCache[productName];
      if (!product) {
        const baseSlug = slugify(productName) || 'product';
        const slug = `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 100)}`;
        product = await Product.findOneAndUpdate(
          { name: productName },
          { $setOnInsert: { name: productName, slug, brandId, categoryId, status: g('status') || 'selling', warrantyMonths: Number(g('warrantyMonths')) || 12 } },
          { upsert: true, new: true }
        );
        productCache[productName] = product;
      }

      const color = g('color');
      const price = Number(g('price'));
      if (color && price > 0) {
        await ProductVariant.findOneAndUpdate(
          { productId: product._id, storage: g('storage'), color },
          { productId: product._id, storage: g('storage'), color, colorHex: g('colorHex') || '', price, salePrice: g('salePrice') ? Number(g('salePrice')) : undefined, stock: Number(g('stock')) || 0, sku: g('sku') || undefined },
          { upsert: true }
        );
        importedVariants++;
      }
    }

    return success(res, { data: { productCount: Object.keys(productCache).length, importedVariants, errors: importErrors } },
      `Import thành công: ${Object.keys(productCache).length} sản phẩm, ${importedVariants} biến thể`);
  } catch (err) { next(err); }
};

// ── CATEGORIES ADMIN ──────────────────────────────────────────────────────────
const getCategories = async (req, res, next) => {
  try {
    const cats = await Category.find().sort({ sortOrder: 1, name_vi: 1 }).lean();
    return success(res, { data: cats });
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    const { name_vi, name_en, description, sortOrder } = req.body;
    const slug = req.body.slug || slugify(name_en || name_vi) || `category-${Date.now()}`;
    const cat = await Category.create({ name_vi, name_en, slug, description, sortOrder: sortOrder || 0 });
    return success(res, { data: cat }, 'Tạo danh mục thành công', 201);
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return error(res, 'Không tìm thấy danh mục', 404);
    return success(res, { data: cat }, 'Cập nhật danh mục thành công');
  } catch (err) { next(err); }
};

const deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    return success(res, {}, 'Đã ẩn danh mục');
  } catch (err) { next(err); }
};

// ── ORDERS ────────────────────────────────────────────────────────────────────
const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.orderCode = { $regex: q, $options: 'i' };

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
    ]);
    return paginate(res, orders, total, page, limit);
  } catch (err) { next(err); }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingCode } = req.body;
    const update = { status };
    if (trackingCode) update.trackingCode = trackingCode;
    if (status === 'delivered') update.deliveredAt = new Date();

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return error(res, 'Không tìm thấy đơn hàng', 404);
    return success(res, { data: order }, 'Cập nhật trạng thái thành công');
  } catch (err) { next(err); }
};

// ── USERS ─────────────────────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const filter = { role: 'user' };
    if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean(),
    ]);
    return paginate(res, users, total, page, limit);
  } catch (err) { next(err); }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') return error(res, 'Không tìm thấy người dùng', 404);
    user.isActive = !user.isActive;
    await user.save();
    return success(res, { data: { isActive: user.isActive } }, `Tài khoản đã được ${user.isActive ? 'mở khóa' : 'khóa'}`);
  } catch (err) { next(err); }
};

// ── COUPONS ───────────────────────────────────────────────────────────────────
const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    return success(res, { data: coupon }, 'Tạo mã giảm giá thành công', 201);
  } catch (err) { next(err); }
};

const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return success(res, { data: coupons });
  } catch (err) { next(err); }
};

const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return error(res, 'Không tìm thấy mã giảm giá', 404);
    return success(res, { data: coupon });
  } catch (err) { next(err); }
};

// ── REVIEWS ───────────────────────────────────────────────────────────────────
const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isApproved } = req.query;
    const filter = {};
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

    const [total, reviews] = await Promise.all([
      Review.countDocuments(filter),
      Review.find(filter)
        .populate('userId', 'name email')
        .populate('productId', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
    ]);
    return paginate(res, reviews, total, page, limit);
  } catch (err) { next(err); }
};

const toggleReviewApproval = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return error(res, 'Không tìm thấy đánh giá', 404);
    review.isApproved = !review.isApproved;
    await review.save();
    return success(res, { data: review }, `Đánh giá đã được ${review.isApproved ? 'duyệt' : 'ẩn'}`);
  } catch (err) { next(err); }
};

// ── RETURNS (ADMIN) ───────────────────────────────────────────────────────────
const getReturnRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const [total, returns] = await Promise.all([
      ReturnRequest.countDocuments(filter),
      ReturnRequest.find(filter)
        .populate('userId', 'name email phone')
        .populate('orderId', 'orderCode totalPrice paymentMethod paymentStatus')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
    ]);
    return paginate(res, returns, total, page, limit);
  } catch (err) { next(err); }
};

const updateReturnRequest = async (req, res, next) => {
  try {
    const { status, adminNote, refundAmount, refundMethod, refundRef } = req.body;
    const returnReq = await ReturnRequest.findById(req.params.id);
    if (!returnReq) return error(res, 'Không tìm thấy yêu cầu trả hàng', 404);

    const update = {};
    if (status)                     update.status = status;
    if (adminNote !== undefined)    update.adminNote = adminNote;
    if (refundAmount !== undefined)  update.refundAmount = Number(refundAmount);
    if (refundMethod)               update.refundMethod = refundMethod;
    if (refundRef)                   update.refundRef = refundRef;

    if (status === 'completed') {
      update.resolvedAt = new Date();
      const actualAmount = Number(refundAmount) || returnReq.refundAmount;

      if (refundMethod === 'wallet') {
        // Tự động hoàn tiền vào ví khách
        const updatedUser = await User.findByIdAndUpdate(
          returnReq.userId,
          { $inc: { walletBalance: actualAmount } },
          { new: true }
        ).select('walletBalance');
        await WalletTransaction.create({
          userId: returnReq.userId,
          type: 'refund',
          amount: actualAmount,
          balanceAfter: updatedUser.walletBalance,
          orderId: returnReq.orderId,
          returnId: returnReq._id,
          description: `Hoàn tiền trả hàng — đơn ${returnReq.orderId}`,
        });
        await Payment.findOneAndUpdate(
          { orderId: returnReq.orderId },
          { refundStatus: 'completed', refundAmount: actualAmount, refundMethod: 'wallet', refundedAt: new Date(), refundNote: 'Hoàn vào ví điện tử' }
        );
      } else {
        await Payment.findOneAndUpdate(
          { orderId: returnReq.orderId },
          { refundStatus: 'completed', refundAmount: actualAmount, refundMethod, refundedAt: new Date(), refundNote: refundRef ? `Mã GD: ${refundRef}` : undefined }
        );
      }

      await Order.findByIdAndUpdate(returnReq.orderId, { status: 'returned', paymentStatus: 'refunded' });
    } else if (status === 'rejected') {
      update.resolvedAt = new Date();
      await Order.findByIdAndUpdate(returnReq.orderId, { status: 'delivered' });
    } else if (status === 'approved') {
      await Order.findByIdAndUpdate(returnReq.orderId, { status: 'return_requested' });
    }

    const updated = await ReturnRequest.findByIdAndUpdate(req.params.id, update, { new: true });
    return success(res, { data: updated }, 'Cập nhật yêu cầu trả hàng thành công');
  } catch (err) { next(err); }
};

// ── WALLET MANAGEMENT (Admin) ─────────────────────────────────────────────────

const getTopupRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const [total, topups] = await Promise.all([
      TopupRequest.countDocuments(filter),
      TopupRequest.find(filter)
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
    ]);
    return paginate(res, topups, total, page, limit);
  } catch (err) { next(err); }
};

const confirmTopup = async (req, res, next) => {
  try {
    const topup = await TopupRequest.findById(req.params.id);
    if (!topup) return error(res, 'Không tìm thấy yêu cầu nạp tiền', 404);
    if (topup.status !== 'pending') return error(res, 'Yêu cầu đã được xử lý', 400);

    const updatedUser = await User.findByIdAndUpdate(
      topup.userId,
      { $inc: { walletBalance: topup.amount } },
      { new: true }
    ).select('walletBalance name');

    await WalletTransaction.create({
      userId: topup.userId,
      type: 'topup',
      amount: topup.amount,
      balanceAfter: updatedUser.walletBalance,
      description: `Nạp tiền qua chuyển khoản — ${topup.ref}`,
      ref: topup.ref,
    });

    await TopupRequest.findByIdAndUpdate(topup._id, { status: 'completed', confirmedAt: new Date() });

    return success(res, { data: { balance: updatedUser.walletBalance } },
      `Đã xác nhận nạp ${topup.amount.toLocaleString('vi-VN')}đ cho ${updatedUser.name}`);
  } catch (err) { next(err); }
};

const getWithdrawalRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const [total, withdrawals] = await Promise.all([
      WithdrawalRequest.countDocuments(filter),
      WithdrawalRequest.find(filter)
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
    ]);
    return paginate(res, withdrawals, total, page, limit);
  } catch (err) { next(err); }
};

const processWithdrawal = async (req, res, next) => {
  try {
    const { status, adminNote, transactionRef } = req.body;
    const withdrawal = await WithdrawalRequest.findById(req.params.id);
    if (!withdrawal) return error(res, 'Không tìm thấy yêu cầu rút tiền', 404);
    if (['completed', 'rejected'].includes(withdrawal.status)) return error(res, 'Yêu cầu đã được xử lý', 400);

    const update = { status, adminNote };

    if (status === 'completed') {
      update.resolvedAt = new Date();
      update.transactionRef = transactionRef;
      // Tạo WalletTransaction xác nhận hoàn thành
      const user = await User.findById(withdrawal.userId).select('walletBalance');
      await WalletTransaction.create({
        userId: withdrawal.userId,
        type: 'adjustment',
        amount: 0, // placeholder — tiền đã trừ khi tạo request
        balanceAfter: user?.walletBalance || 0,
        description: `Rút tiền hoàn thành — ${transactionRef || 'Đã chuyển khoản'}`,
        ref: transactionRef,
      });
    } else if (status === 'rejected') {
      update.resolvedAt = new Date();
      // Hoàn tiền vào ví
      const updatedUser = await User.findByIdAndUpdate(
        withdrawal.userId,
        { $inc: { walletBalance: withdrawal.amount } },
        { new: true }
      ).select('walletBalance');
      await WalletTransaction.create({
        userId: withdrawal.userId,
        type: 'adjustment',
        amount: withdrawal.amount,
        balanceAfter: updatedUser.walletBalance,
        description: `Hoàn tiền rút thất bại — ${adminNote || 'Yêu cầu bị từ chối'}`,
      });
    }

    await WithdrawalRequest.findByIdAndUpdate(withdrawal._id, update);
    return success(res, {}, status === 'completed' ? 'Đã xác nhận rút tiền thành công' : 'Đã từ chối yêu cầu, tiền hoàn về ví');
  } catch (err) { next(err); }
};

module.exports = {
  getDashboard,
  getProducts, createProduct, updateProduct, deleteProduct,
  updateVariant, createVariant, deleteVariant,
  uploadProductImage, exportProductsCsv, importProductsCsv,
  getCategories, createCategory, updateCategory, deleteCategory,
  getOrders, updateOrderStatus,
  getUsers, toggleUserStatus,
  createCoupon, getCoupons, updateCoupon,
  getReviews, toggleReviewApproval,
  getReturnRequests, updateReturnRequest,
  getTopupRequests, confirmTopup,
  getWithdrawalRequests, processWithdrawal,
};
