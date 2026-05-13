import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getBrands } from '../api/products';
import PhoneGrid from '../components/phone/PhoneGrid';
import { AlertCircle, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

const SORTS = [
  { label: 'Mới nhất',     value: 'newest' },
  { label: 'Giá tăng dần', value: 'price_asc' },
  { label: 'Giá giảm dần', value: 'price_desc' },
  { label: 'Bán chạy',     value: 'popular' },
  { label: 'Đánh giá cao', value: 'rating' },
];

const PRICE_RANGES = [
  { label: 'Dưới 3 triệu',    min: 0,       max: 3000000 },
  { label: '3 – 7 triệu',     min: 3000000, max: 7000000 },
  { label: '7 – 15 triệu',    min: 7000000, max: 15000000 },
  { label: '15 – 25 triệu',   min: 15000000,max: 25000000 },
  { label: 'Trên 25 triệu',   min: 25000000,max: '' },
];

const LIMIT = 20;

export default function PhoneListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [phones, setPhones]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [error, setError]     = useState('');
  const [brands, setBrands]   = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  // Params từ URL
  const sort      = searchParams.get('sort') || 'newest';
  const page      = Number(searchParams.get('page') || 1);
  const brand     = searchParams.get('brand') || '';
  const priceKey  = searchParams.get('price') || '';
  const totalPages = Math.ceil(total / LIMIT);

  // Tìm price range từ key
  const priceRange = PRICE_RANGES.find((_, i) => String(i) === priceKey) || null;

  // Load brands một lần
  useEffect(() => {
    getBrands().then((r) => setBrands(r.data.data || [])).catch(() => {});
  }, []);

  // Load products khi params thay đổi
  useEffect(() => {
    setLoading(true);
    setError('');
    const params = { sort, page, limit: LIMIT };
    if (brand) params.brand = brand;
    if (priceRange) {
      if (priceRange.min) params.minPrice = priceRange.min;
      if (priceRange.max) params.maxPrice = priceRange.max;
    }
    getProducts(params)
      .then((res) => { setPhones(res.data.data); setTotal(res.data.pagination?.total || 0); })
      .catch(() => setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [sort, page, brand, priceKey]);

  const setParam = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const clearFilters = () => {
    setSearchParams({ sort, page: '1' });
  };

  const hasFilter = brand || priceKey;

  const goPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-xl font-bold text-gray-800">
          Tất cả điện thoại
          <span className="text-gray-400 font-normal text-base ml-2">({total} sản phẩm)</span>
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setShowFilter((v) => !v)}
            className="md:hidden flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:border-red-300"
          >
            <SlidersHorizontal size={15} /> Lọc {hasFilter && <span className="text-red-600 font-semibold">•</span>}
          </button>
          {/* Sort buttons */}
          {SORTS.map((s) => (
            <button key={s.value}
              onClick={() => setParam('sort', s.value)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${sort === s.value ? 'bg-red-600 text-white border-red-600' : 'text-gray-600 border-gray-200 hover:border-red-300'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active filters */}
      {hasFilter && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-gray-500">Đang lọc:</span>
          {brand && (
            <span className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">
              {brands.find((b) => b.slug === brand)?.name || brand}
              <button onClick={() => setParam('brand', '')}><X size={11} /></button>
            </span>
          )}
          {priceRange && (
            <span className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">
              {priceRange.label}
              <button onClick={() => setParam('price', '')}><X size={11} /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500 underline">
            Xóa tất cả
          </button>
        </div>
      )}

      <div className="flex gap-6">

        {/* Sidebar filter — desktop luôn hiện, mobile toggle */}
        <aside className={`shrink-0 w-56 space-y-6 ${showFilter ? 'block' : 'hidden'} md:block`}>

          {/* Thương hiệu */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Thương hiệu</h3>
            <div className="space-y-2">
              {brands.map((b) => (
                <label key={b._id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="brand"
                    value={b.slug}
                    checked={brand === b.slug}
                    onChange={() => setParam('brand', brand === b.slug ? '' : b.slug)}
                    className="accent-red-600 w-4 h-4"
                  />
                  <span className={`text-sm transition-colors ${brand === b.slug ? 'text-red-600 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>
                    {b.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Khoảng giá */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Khoảng giá</h3>
            <div className="space-y-2">
              {PRICE_RANGES.map((range, i) => (
                <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="price"
                    value={String(i)}
                    checked={priceKey === String(i)}
                    onChange={() => setParam('price', priceKey === String(i) ? '' : String(i))}
                    className="accent-red-600 w-4 h-4"
                  />
                  <span className={`text-sm transition-colors ${priceKey === String(i) ? 'text-red-600 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {hasFilter && (
            <button onClick={clearFilters}
              className="w-full text-sm text-gray-500 border border-gray-200 rounded-lg py-2 hover:border-red-300 hover:text-red-500 transition-colors">
              Xóa bộ lọc
            </button>
          )}
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {error ? (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-xl">
              <AlertCircle size={18} /> {error}
            </div>
          ) : (
            <>
              <PhoneGrid phones={phones} loading={loading} />

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-8">
                  <button
                    onClick={() => goPage(page - 1)}
                    disabled={page <= 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    // Hiển thị trang gần current
                    let p;
                    if (totalPages <= 7) {
                      p = i + 1;
                    } else if (page <= 4) {
                      p = i + 1 === 7 ? totalPages : i + 1;
                    } else if (page >= totalPages - 3) {
                      p = i === 0 ? 1 : totalPages - 6 + i;
                    } else {
                      const mid = [1, page - 1, page, page + 1, totalPages];
                      p = mid[i] ?? null;
                    }
                    if (!p) return null;
                    const isDots = i > 0 && p - (i === 1 ? 1 : page) > 1;
                    return isDots ? (
                      <span key={i} className="w-9 text-center text-gray-400 text-sm">…</span>
                    ) : (
                      <button key={p} onClick={() => goPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-red-600 text-white border-red-600' : 'border border-gray-200 text-gray-600 hover:border-red-300'}`}>
                        {p}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => goPage(page + 1)}
                    disabled={page >= totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {!loading && totalPages > 1 && (
                <p className="text-center text-xs text-gray-400 mt-2">
                  Trang {page} / {totalPages} · {total} sản phẩm
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
