import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProducts } from '../api/products';
import PhoneGrid from '../components/phone/PhoneGrid';
import { AlertCircle } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setError('');
    searchProducts(q, 20)
      .then((res) => setPhones(res.data.data))
      .catch(() => setError('Có lỗi khi tìm kiếm. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        Kết quả cho: "<span className="text-red-600">{q}</span>"
        {!loading && !error && (
          <span className="text-gray-400 font-normal text-base ml-2">({phones.length} sản phẩm)</span>
        )}
      </h1>
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
