import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { formatPrice, discountPercent } from '../../utils/formatPrice';
import { useCart } from '../../context/CartContext';

const BADGE_COLORS = {
  New: 'bg-blue-500',
  Hot: 'bg-orange-500',
  Sale: 'bg-red-600',
  'Best Seller': 'bg-green-600',
};

export default function PhoneCard({ phone }) {
  const { addItem } = useCart();

  // Giá hiển thị từ cheapestVariant (list page) hoặc variants[0] (fallback)
  const variant = phone.cheapestVariant || phone.variants?.[0];
  const price = variant?.salePrice || variant?.price || 0;
  const originalPrice = variant?.salePrice ? variant.price : null;
  const image = phone.images?.[0] || 'https://placehold.co/300x300?text=No+Image';

  return (
    <div className="card group relative flex flex-col">
      {phone.badge && (
        <span className={`absolute top-2 left-2 z-10 text-white text-xs font-medium px-2 py-0.5 rounded-full ${BADGE_COLORS[phone.badge]}`}>
          {phone.badge}
        </span>
      )}
      {originalPrice && (
        <span className="absolute top-2 right-2 z-10 bg-red-50 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
          -{discountPercent(originalPrice, price)}%
        </span>
      )}

      <Link to={`/products/${phone.slug}`} className="block overflow-hidden rounded-t-xl">
        <img
          src={image}
          alt={phone.name}
          loading="lazy"
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <Link to={`/products/${phone.slug}`} className="text-sm font-medium text-gray-800 dark:text-gray-100 hover:text-red-600 line-clamp-2 mb-1">
          {phone.name}
        </Link>

        <div className="flex items-center gap-1 text-xs text-yellow-500 mb-2">
          <Star size={12} fill="currentColor" />
          <span className="text-gray-500 dark:text-gray-400">{phone.rating} ({phone.reviewCount})</span>
        </div>

        <div className="mt-auto">
          <div className="text-red-600 font-bold text-base">{price ? formatPrice(price) : 'Liên hệ'}</div>
          {originalPrice && (
            <div className="text-gray-400 dark:text-gray-500 text-xs line-through">{formatPrice(originalPrice)}</div>
          )}
        </div>

        <button
          onClick={() => variant && addItem(phone, variant)}
          disabled={!variant || variant.stock === 0}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-red-600 text-white text-sm py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} />
          {variant?.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>
      </div>
    </div>
  );
}
