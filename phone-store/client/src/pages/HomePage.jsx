import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '../api/products';
import PhoneGrid from '../components/phone/PhoneGrid';
import { ChevronRight, AlertCircle } from 'lucide-react';

const BRANDS = [
  { name: 'Apple',   slug: 'apple',   logo: '🍎' },
  { name: 'Samsung', slug: 'samsung', logo: '🌌' },
  { name: 'Xiaomi',  slug: 'xiaomi',  logo: '📱' },
  { name: 'OPPO',    slug: 'oppo',    logo: '📷' },
  { name: 'Vivo',    slug: 'vivo',    logo: '🎵' },
  { name: 'Realme',  slug: 'realme',  logo: '⚡' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFeaturedProducts()
      .then((res) => setFeatured(res.data.data))
      .catch(() => setError('Không thể tải sản phẩm. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-red-200 text-sm font-medium mb-2">Mới ra mắt</p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
            Điện Thoại Chính Hãng<br />Giá Tốt Nhất
          </h1>
          <p className="text-red-100 mb-6">Bảo hành 12 tháng · Giao hàng toàn quốc · Trả góp 0%</p>
          <Link to="/products" className="bg-white text-red-600 font-semibold px-6 py-2.5 rounded-lg hover:bg-red-50 transition-colors inline-block">
            Mua ngay
          </Link>
        </div>
        <div className="text-8xl">📱</div>
      </div>

      {/* Brands */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Thương hiệu nổi bật</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {BRANDS.map((b) => (
            <Link key={b.slug} to={`/brand/${b.slug}`}
              className="card p-4 flex flex-col items-center gap-2 text-center hover:border-red-200 hover:border transition-all">
              <span className="text-3xl">{b.logo}</span>
              <span className="text-sm font-medium text-gray-700">{b.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Sản phẩm bán chạy</h2>
          <Link to="/products" className="flex items-center gap-1 text-sm text-red-600 hover:underline font-medium">
            Xem tất cả <ChevronRight size={16} />
          </Link>
        </div>
        {error ? (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-xl">
            <AlertCircle size={18} /> {error}
          </div>
        ) : (
          <PhoneGrid phones={featured} loading={loading} />
        )}
      </section>

      {/* Promo */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-2xl p-6 flex items-center gap-4">
          <span className="text-4xl">💳</span>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Trả góp 0%</h3>
            <p className="text-sm text-gray-500">Lên đến 24 tháng, không cần chứng minh thu nhập</p>
          </div>
        </div>
        <div className="bg-green-50 rounded-2xl p-6 flex items-center gap-4">
          <span className="text-4xl">🔄</span>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Thu cũ đổi mới</h3>
            <p className="text-sm text-gray-500">Định giá minh bạch, hỗ trợ tối đa</p>
          </div>
        </div>
      </div>
    </div>
  );
}
