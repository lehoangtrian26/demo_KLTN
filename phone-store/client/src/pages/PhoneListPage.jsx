import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/products';
import PhoneGrid from '../components/phone/PhoneGrid';
import { AlertCircle } from 'lucide-react';

const SORTS = [
  { label: 'Mới nhất',     value: 'newest' },
  { label: 'Giá tăng dần', value: 'price_asc' },
  { label: 'Giá giảm dần', value: 'price_desc' },
  { label: 'Bán chạy',     value: 'popular' },
  { label: 'Đánh giá cao', value: 'rating' },
];

export default function PhoneListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    setLoading(true);
    setError('');
    getProducts({ sort, page })
      .then((res) => { setPhones(res.data.data); setTotal(res.data.pagination.total); })
      .catch(() => setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [sort, page]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Tất cả điện thoại <span className="text-gray-400 font-normal text-base">({total} sản phẩm)</span>
        </h1>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <button key={s.value} onClick={() => setSearchParams({ sort: s.value, page: 1 })}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${sort === s.value ? 'bg-red-600 text-white border-red-600' : 'text-gray-600 border-gray-200 hover:border-red-300'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {error ? (
        <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-xl">
          <AlertCircle size={18} /> {error}
        </div>
      ) : (
        <PhoneGrid phones={phones} loading={loading} />
      )}
    </div>
  );
}
