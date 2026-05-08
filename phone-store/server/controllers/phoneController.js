const Phone = require('../models/Phone');

const getPhones = async (req, res) => {
  const { brand, minPrice, maxPrice, sort, page = 1, limit = 20, q } = req.query;

  const filter = {};
  if (brand) filter.brand = brand;
  if (minPrice || maxPrice) filter.price = {};
  if (minPrice) filter.price.$gte = Number(minPrice);
  if (maxPrice) filter.price.$lte = Number(maxPrice);
  if (q) filter.name = { $regex: q, $options: 'i' };

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    popular: { sold: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const total = await Phone.countDocuments(filter);
  const phones = await Phone.find(filter)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ phones, total, page: Number(page), pages: Math.ceil(total / limit) });
};

const getPhoneBySlug = async (req, res) => {
  const phone = await Phone.findOne({ slug: req.params.slug });
  if (!phone) return res.status(404).json({ message: 'Không tìm thấy điện thoại' });
  res.json(phone);
};

const getPhonesByBrand = async (req, res) => {
  const phones = await Phone.find({ brand: req.params.brand }).sort({ createdAt: -1 });
  res.json(phones);
};

const getFeaturedPhones = async (req, res) => {
  const phones = await Phone.find({ inStock: true }).sort({ sold: -1 }).limit(8);
  res.json(phones);
};

module.exports = { getPhones, getPhoneBySlug, getPhonesByBrand, getFeaturedPhones };
