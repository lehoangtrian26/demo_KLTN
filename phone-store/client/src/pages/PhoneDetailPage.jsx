import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getProductBySlug } from '../api/products';
import { formatPrice, discountPercent } from '../utils/formatPrice';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, Shield, Truck, ChevronRight } from 'lucide-react';

export default function PhoneDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImg, setMainImg] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    getProductBySlug(slug)
      .then((res) => {
        const p = res.data.data;
        setProduct(p);
        // Chọn mặc định variant đầu tiên
        if (p.variants?.length) {
          setSelectedStorage(p.variants[0].storage || '');
          setSelectedColor(p.variants[0].color || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

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
    // Reset về màu đầu tiên của storage đó
    const firstColor = product.variants.find((v) => v.storage === storage)?.color || '';
    setSelectedColor(firstColor);
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
                  <button key={v._id} onClick={() => setSelectedColor(v.color)}
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

          {/* CTA */}
          <button
            onClick={() => addItem(product, selectedVariant)}
            disabled={!selectedVariant || selectedVariant.stock === 0}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors mb-4 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={20} />
            {selectedVariant?.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
          </button>

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

          {/* Reviews */}
          {product.reviews?.length > 0 && (
            <div className="mt-6 border-t pt-5">
              <h3 className="font-semibold text-gray-800 mb-3">Đánh giá ({product.reviewCount})</h3>
              <div className="space-y-4">
                {product.reviews.slice(0, 3).map((r) => (
                  <div key={r._id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600 shrink-0">
                      {r.userId?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.userId?.name}</p>
                      <div className="flex text-yellow-400 my-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} fill={i < r.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
