/**
 * Từ danh sách variants, trả về map { productId → cheapestVariant }
 * Ưu tiên variant có salePrice thấp nhất, fallback về price
 */
const getCheapestVariantMap = (variants) => {
  const map = {};
  variants.forEach((v) => {
    const pid = v.productId.toString();
    const ep = v.salePrice || v.price;
    const existing = map[pid];
    if (!existing || ep < (existing.salePrice || existing.price)) {
      map[pid] = v;
    }
  });
  return map;
};

/**
 * Gắn cheapestVariant vào mỗi product document
 */
const attachCheapestVariant = (products, variantMap) =>
  products.map((p) => ({ ...p, cheapestVariant: variantMap[p._id.toString()] || null }));

module.exports = { getCheapestVariantMap, attachCheapestVariant };
