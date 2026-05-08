export const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export const discountPercent = (original, current) =>
  Math.round(((original - current) / original) * 100);
