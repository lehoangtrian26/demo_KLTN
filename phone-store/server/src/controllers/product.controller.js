const mongoose = require('mongoose');
const { Product, ProductVariant, Review, Brand, Category } = require('../models/index');
const { success, error, paginate } = require('../utils/response.utils');
const { getCheapestVariantMap, attachCheapestVariant } = require('../utils/variant.utils');

const SORT_MAP = {
  newest:     { createdAt: -1 },
  price_asc:  { sold: 1 },
  price_desc:  { sold: -1 },
  popular:    { sold: -1 },
  rating:     { rating: -1 },
};

const VARIANT_LIST_SELECT = 'productId price salePrice color storage stock';

// ─── Helper: lấy cheapestVariant cho danh sách products ──────────────────────
const populateCheapestVariants = async (products) => {
  const ids = products.map((p) => p._id);
  const variants = await ProductVariant.find({ productId: { $in: ids }, isActive: true })
    .select(VARIANT_LIST_SELECT)
    .lean();
  return attachCheapestVariant(products, getCheapestVariantMap(variants));
};

// GET /api/products
const listProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, brand, category, minPrice, maxPrice, status, sort = 'newest', q } = req.query;

    const filter = { isActive: true, status: status || 'selling' };
    if (q) filter.name = { $regex: q, $options: 'i' };

    if (brand) {
      const brandDoc = await Brand.findOne({ slug: brand }).lean();
      if (brandDoc) filter.brandId = brandDoc._id;
    }
    if (category) {
      const catDoc = await Category.findOne({ slug: category }).lean();
      if (catDoc) filter.categoryId = catDoc._id;
    }
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      const variantIds = await ProductVariant.find({ price: priceFilter, isActive: true }).distinct('productId');
      filter._id = { $in: variantIds };
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .populate('brandId', 'name slug logo')
        .populate('categoryId', 'name_vi slug')
        .sort(SORT_MAP[sort] || SORT_MAP.newest)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
    ]);

    const result = await populateCheapestVariants(products);
    return paginate(res, result, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/featured
const getFeatured = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, status: 'selling' })
      .populate('brandId', 'name slug')
      .sort({ sold: -1 })
      .limit(8)
      .lean();

    const result = await populateCheapestVariants(products);
    return success(res, { data: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/search?q=
const searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q || !q.trim()) return error(res, 'Từ khóa tìm kiếm là bắt buộc', 400);

    const products = await Product.find({
      isActive: true,
      status: 'selling',
      name: { $regex: q.trim(), $options: 'i' },
    })
      .populate('brandId', 'name slug')
      .limit(Number(limit))
      .lean();

    const result = await populateCheapestVariants(products);
    return success(res, { data: result, total: result.length });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/compare?ids=id1,id2,id3
const compareProducts = async (req, res, next) => {
  try {
    const { ids } = req.query;
    if (!ids) return error(res, 'Danh sách ids là bắt buộc', 400);

    const idList = ids.split(',').slice(0, 4).filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (idList.length < 2) return error(res, 'Cần ít nhất 2 sản phẩm để so sánh', 400);

    const products = await Product.find({ _id: { $in: idList } })
      .populate('brandId', 'name slug')
      .populate('categoryId', 'name_vi')
      .lean();

    const variants = await ProductVariant.find({ productId: { $in: idList }, isActive: true }).lean();
    const variantsByProduct = {};
    variants.forEach((v) => {
      const pid = v.productId.toString();
      if (!variantsByProduct[pid]) variantsByProduct[pid] = [];
      variantsByProduct[pid].push(v);
    });

    const result = products.map((p) => ({ ...p, variants: variantsByProduct[p._id.toString()] || [] }));
    return success(res, { data: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:slug
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('brandId', 'name slug logo')
      .populate('categoryId', 'name_vi slug')
      .lean();

    if (!product) return error(res, 'Không tìm thấy sản phẩm', 404);

    const [variants, reviews] = await Promise.all([
      ProductVariant.find({ productId: product._id, isActive: true }).lean(),
      Review.find({ productId: product._id, isApproved: true })
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return success(res, { data: { ...product, variants, reviews } });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id/related
const getRelated = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return error(res, 'ID không hợp lệ', 400);

    const product = await Product.findById(req.params.id).lean();
    if (!product) return error(res, 'Không tìm thấy sản phẩm', 404);

    if (product.relatedProducts?.length) {
      const related = await Product.find({ _id: { $in: product.relatedProducts }, isActive: true })
        .populate('brandId', 'name slug')
        .limit(6)
        .lean();
      const result = await populateCheapestVariants(related);
      return success(res, { data: result });
    }

    const related = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      status: 'selling',
      $or: [{ brandId: product.brandId }, { categoryId: product.categoryId }],
    })
      .populate('brandId', 'name slug')
      .limit(6)
      .lean();

    const result = await populateCheapestVariants(related);
    return success(res, { data: result });
  } catch (err) {
    next(err);
  }
};

// POST /api/products/:variantId/notify-stock
const notifyStock = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(variantId)) return error(res, 'variantId không hợp lệ', 400);

    const variant = await ProductVariant.findById(variantId);
    if (!variant) return error(res, 'Không tìm thấy variant', 404);
    if (variant.stock > 0) return error(res, 'Sản phẩm vẫn còn hàng', 400);

    await ProductVariant.findByIdAndUpdate(variantId, { $addToSet: { stockWatchers: req.user._id } });
    return success(res, {}, 'Đã đăng ký nhận thông báo khi có hàng');
  } catch (err) {
    next(err);
  }
};

module.exports = { listProducts, getFeatured, searchProducts, compareProducts, getProductBySlug, getRelated, notifyStock };
