import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlug, getRelatedProducts } from '../api/products';
import { addToWishlist, removeFromWishlist, checkWishlist } from '../api/wishlist';
import { formatPrice, discountPercent } from '../utils/formatPrice';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ReviewSection from '../components/phone/ReviewSection';
import PhoneCard from '../components/phone/PhoneCard';
import { ShoppingCart, Star, Shield, Truck, ChevronRight, Heart } from 'lucide-react';

export default function PhoneDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImg, setMainImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    setRelated([]);
    setIsWishlisted(false);
    getProductBySlug(slug)
      .then((res) => {
        const p = res.data.data;
        setProduct(p);
        if (p.variants?.length) {
          setSelectedStorage(p.variants[0].storage || '');
          setSelectedColor(p.variants[0].color || '');
        }
        // Lấy sản phẩm liên quan
        getRelatedProducts(p._id).then((r) => setRelated(r.data.data || [])).catch(() => {});
        // Kiểm tra wishlist
        if (user) checkWishlist(p._id).then((r) => setIsWishlisted(r.data.data.isWishlisted)).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, user]);

  // Danh sách storage unique
  const storages = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.storage).filter(Boolean))];
  }, [product]);

  // Màu sắc theo storage đang chọn
  const colors = useMemo(() => {
    if (!product?.variants) return [];
    return product.variants.filter((v) => v.storage === selectedStorage || !selectedStorage);
  }, [product, selectedStorage]);

  // Variant hiện tại
  const selectedVariant = useMemo(() => {
    if (!product?.variants) return null;
    return product.variants.find(
      (v) => v.storage === selectedStorage && v.color === selectedColor
    ) || product.variants[0];
  }, [product, selectedStorage, selectedColor]);

  const handleStorageSelect = (storage) => {
    setSelectedStorage(storage);
    const firstColor = product.variants.find((v) => v.storage === storage)?.color || '';
    setSelectedColor(firstColor);
    setQty(1); // reset số lượng khi đổi variant
  };

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">Đang tải...</div>;
  if (!product) return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">Không tìm thấy sản phẩm.</div>;

  const price = selectedVariant?.salePrice || selectedVariant?.price || 0;
  const originalPrice = selectedVariant?.salePrice ? selectedVariant.price : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-400 mb-6">
        <a href="/" className="hover:text-red-600">Trang chủ</a>
        <ChevronRight size={14} />
        <a href="/products" className="hover:text-red-600">Điện thoại</a>
        <ChevronRight size={14} />
        <span className="text-gray-700">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-square mb-3">
            <img
              src={product.images?.[mainImg] || 'https://placehold.co/600x600?text=No+Image'}
              alt={product.name}
              className="w-full h-full object-contain p-6"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setMainImg(i)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${mainImg === i ? 'border-red-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-400 mb-1">{product.brandId?.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill={i < Math.round(product.rating) ? 'currentColor' : 'none'} />
              ))}
            </div>
            <span className="text-sm text-gray-500">{product.reviewCount} đánh giá</span>
            <span className="text-sm text-gray-400">·</span>
            <span className="text-sm text-gray-500">Đã bán {product.sold?.toLocaleString()}</span>
          </div>

          {/* Giá */}
          <div className="bg-red-50 rounded-xl p-4 mb-5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-red-600">{formatPrice(price)}</span>
              {originalPrice && (
                <>
                  <span className="text-gray-400 line-through text-lg">{formatPrice(originalPrice)}</span>
                  <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-0.5 rounded-full">
                    -{discountPercent(originalPrice, price)}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Storage */}
          {storages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Dung lượng:</p>
              <div className="flex flex-wrap gap-2">
                {storages.map((s) => (
                  <button key={s} onClick={() => handleStorageSelect(s)}
                    className={`px-4 py-1.5 text-sm rounded-lg border transition-colors ${selectedStorage === s ? 'border-red-500 text-red-600 bg-red-50 font-medium' : 'border-gray-200 text-gray-600 hover:border-red-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          {colors.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Màu sắc: <span className="font-normal text-gray-500">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((v) => (
                  <button key={v._id} onClick={() => { setSelectedColor(v.color); setQty(1); }}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${selectedColor === v.color ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}>
                    {v.colorHex && (
                      <span className="w-4 h-4 rounded-full border border-gray-200 shrink-0"
                        style={{ backgroundColor: v.colorHex }} />
                    )}
                    {v.color}
                    {v.stock === 0 && <span className="text-xs text-gray-400">(Hết)</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chọn số lượng + CTA */}
          <div className="flex gap-3 mb-4">
            {/* Quantity selector */}
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium"
              >−</button>
              <span className="w-10 text-center text-sm font-semibold text-gray-800">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(selectedVariant?.stock || 10, q + 1))}
                disabled={qty >= (selectedVariant?.stock || 0)}
                className="w-10 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium disabled:text-gray-300"
              >+</button>
            </div>

            <button
              onClick={() => { addItem(product, selectedVariant, qty); setQty(1); }}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={20} />
              {selectedVariant?.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
            </button>
            {user && (
              <button
                onClick={async () => {
                  try {
                    if (isWishlisted) {
                      await removeFromWishlist(product._id);
                    } else {
                      await addToWishlist(product._id);
                    }
                    setIsWishlisted(!isWishlisted);
                  } catch {}
                }}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-colors ${isWishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-300'}`}
                title={isWishlisted ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
            <p className="text-orange-500 text-sm text-center mb-4">Chỉ còn {selectedVariant.stock} sản phẩm!</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Shield size={16} className="text-green-500" /> Bảo hành {product.warrantyMonths} tháng</div>
            <div className="flex items-center gap-2"><Truck size={16} className="text-blue-500" /> Giao hàng toàn quốc</div>
          </div>

          {/* Specs */}
          {product.specs && (
            <div className="mt-6 border-t pt-5">
              <h3 className="font-semibold text-gray-800 mb-3">Thông số kỹ thuật</h3>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Màn hình', product.specs.display],
                    ['Chip xử lý', product.specs.chip],
                    ['RAM', product.specs.ram],
                    ['Pin', product.specs.battery],
                    ['Camera', product.specs.camera],
                    ['Hệ điều hành', product.specs.os],
                    ['SIM', product.specs.sim],
                    ['Kết nối', product.specs.connectivity],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <tr key={label} className="border-b last:border-0">
                      <td className="py-2 text-gray-500 w-2/5">{label}</td>
                      <td className="py-2 text-gray-800">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* Reviews section */}
      <ReviewSection productId={product._id} />

      {/* Sản phẩm liên quan */}
      {related.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Sản phẩm liên quan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.slice(0, 4).map((p) => <PhoneCard key={p._id} phone={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
