import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Edit2, Trash2 } from 'lucide-react';
import { getProductReviews, createReview, deleteReview } from '../../api/reviews';
import { useAuth } from '../../context/AuthContext';

const Stars = ({ value, onChange, size = 20 }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <button key={i} type="button" onClick={() => onChange?.(i)} className={onChange ? 'cursor-pointer' : 'cursor-default'}>
        <Star size={size} className={i <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
      </button>
    ))}
  </div>
);

export default function ReviewSection({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getProductReviews(productId, { page, limit: 5 })
      .then((res) => { setReviews(res.data.data); setTotal(res.data.pagination.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId, page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) return setError('Vui lòng nhập nội dung đánh giá');
    setSubmitting(true);
    setError('');
    try {
      const res = await createReview({ productId, ...form });
      setReviews((prev) => [res.data.data, ...prev]);
      setTotal((t) => t + 1);
      setShowForm(false);
      setForm({ rating: 5, comment: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa đánh giá này?')) return;
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      setTotal((t) => t - 1);
    } catch (err) { alert(err.response?.data?.message || 'Không thể xóa'); }
  };

  // Thống kê rating
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Đánh giá sản phẩm</h3>
          <p className="text-sm text-gray-500">{total} đánh giá</p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-gray-800">{avgRating}</span>
            <div>
              <Stars value={Math.round(avgRating)} size={16} />
              <p className="text-xs text-gray-400 mt-0.5">{total} đánh giá</p>
            </div>
          </div>
        )}
      </div>

      {/* Form viết đánh giá */}
      {user && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="w-full mb-6 flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-3 text-gray-500 hover:border-red-300 hover:text-red-600 transition-colors text-sm font-medium">
          <Edit2 size={16} /> Viết đánh giá của bạn
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</p>
            <Stars value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
          </div>
          <div>
            <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..." rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-outline py-2 rounded-xl text-sm">Hủy</button>
            <button type="submit" disabled={submitting} className="flex-1 btn-primary py-2 rounded-xl text-sm disabled:opacity-60">
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      )}

      {/* Danh sách reviews */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Star size={40} className="mx-auto mb-2 text-gray-200" />
          <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="border-b pb-4 last:border-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600 shrink-0">
                    {r.userId?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800">{r.userId?.name}</p>
                      {r.isVerifiedPurchase && (
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Đã mua hàng</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Stars value={r.rating} size={12} />
                      <span className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
                {user && user._id === r.userId?._id && (
                  <button onClick={() => handleDelete(r._id)} className="text-gray-300 hover:text-red-500 shrink-0">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              {r.comment && <p className="text-sm text-gray-600 mt-2 ml-12">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Phân trang */}
      {total > 5 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(total / 5) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
