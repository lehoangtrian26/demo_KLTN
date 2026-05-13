import { useEffect, useState } from 'react';
import { getAdminReviews, toggleReview } from '../../api/admin';
import { Star, CheckCircle, EyeOff } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    getAdminReviews(filter !== '' ? { isApproved: filter } : {})
      .then((res) => setReviews(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  const handleToggle = async (id) => {
    try {
      const res = await toggleReview(id);
      setReviews((prev) => prev.map((r) => r._id === id ? { ...r, isApproved: res.data.data.isApproved } : r));
    } catch (err) { alert(err.response?.data?.message); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đánh giá</h1>
      <div className="flex gap-2 mb-5">
        {[{ label: 'Tất cả', value: '' }, { label: 'Đã duyệt', value: 'true' }, { label: 'Ẩn', value: 'false' }].map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`text-sm px-4 py-1.5 rounded-full border ${filter === f.value ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 text-gray-600'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-gray-400 text-center py-8">Đang tải...</p>
          : !reviews.length ? <p className="text-gray-400 text-center py-8">Không có đánh giá</p>
          : reviews.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-medium text-gray-800 text-sm">{r.userId?.name}</p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  {r.isVerifiedPurchase && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Đã mua</span>}
                </div>
                <p className="text-sm text-gray-500 italic mb-1">"{r.productId?.name}"</p>
                <p className="text-sm text-gray-700">{r.comment || <span className="text-gray-400">Không có nội dung</span>}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.isApproved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {r.isApproved ? 'Đã duyệt' : 'Đã ẩn'}
                </span>
                <button onClick={() => handleToggle(r._id)}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium ${r.isApproved ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                  {r.isApproved ? <><EyeOff size={12} /> Ẩn</> : <><CheckCircle size={12} /> Duyệt</>}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
