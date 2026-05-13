import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/products';
import PhoneCard from '../components/phone/PhoneCard';
import { Headphones, Zap, Wifi, Shield, Cable, SlidersHorizontal } from 'lucide-react';

const CATS = [
  { label: 'Tất cả',         slug: '',              icon: SlidersHorizontal },
  { label: 'Tai nghe',       slug: 'tai-nghe',       icon: Headphones },
  { label: 'Sạc nhanh',      slug: 'sac-nhanh',      icon: Zap },
  { label: 'Sạc không dây',  slug: 'sac-khong-day',  icon: Wifi },
  { label: 'Ốp lưng',        slug: 'op-lung',        icon: Shield },
  { label: 'Cáp sạc',        slug: 'cap-sac',        icon: Cable },
];

const SORTS = [
  { label: 'Bán chạy',     value: 'popular' },
  { label: 'Mới nhất',     value: 'newest' },
  { label: 'Giá tăng dần', value: 'price_asc' },
  { label: 'Giá giảm dần', value: 'price_desc' },
];

export default function AccessoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);

  const cat  = searchParams.get('category') || '';
  const sort = searchParams.get('sort')     || 'popular';

  useEffect(() => {
    setLoading(true);
    const params = { sort, limit: 20 };
    // Nếu không chọn category cụ thể → lấy tất cả accessory categories
    if (cat) {
      params.category = cat;
    } else {
      // Lấy tất cả bằng cách gọi song song rồi gộp
      Promise.all(
        CATS.filter((c) => c.slug).map((c) => getProducts({ ...params, category: c.slug }))
      ).then((results) => {
        const all = results.flatMap((r) => r.data.data || []);
        // Dedupe by _id
        const seen = new Set();
        const unique = all.filter((p) => { if (seen.has(p._id)) return false; seen.add(p._id); return true; });
        setProducts(unique);
        setTotal(unique.length);
      }).finally(() => setLoading(false));
      return;
    }

    getProducts(params)
      .then((r) => { setProducts(r.data.data || []); setTotal(r.data.pagination?.total || 0); })
      .finally(() => setLoading(false));
  }, [cat, sort]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Phụ kiện điện thoại</h1>
        <p className="text-gray-500 text-sm">Tai nghe, sạc nhanh, ốp lưng và nhiều hơn nữa</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATS.map(({ label, slug, icon: Icon }) => (
          <button key={slug}
            onClick={() => setParam('category', slug)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
              cat === slug
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <p className="text-sm text-gray-500">{total} sản phẩm</p>
        <div className="flex gap-2">
          {SORTS.map((s) => (
            <button key={s.value}
              onClick={() => setParam('sort', s.value)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                sort === s.value
                  ? 'bg-red-600 text-white border-red-600'
                  : 'text-gray-600 border-gray-200 hover:border-red-300'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <div key={i} className="card animate-pulse aspect-[3/4]" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="font-medium">Không có sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => <PhoneCard key={p._id} phone={p} />)}
        </div>
      )}
    </div>
  );
}
