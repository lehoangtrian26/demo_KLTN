import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api/orders';
import { formatPrice } from '../utils/formatPrice';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';

const STATUS = {
  pending:          { text: 'Chờ xác nhận',  color: 'bg-yellow-100 text-yellow-700' },
  confirmed:        { text: 'Đã xác nhận',   color: 'bg-blue-100 text-blue-700' },
  preparing:        { text: 'Đang chuẩn bị', color: 'bg-purple-100 text-purple-700' },
  shipping:         { text: 'Đang giao',     color: 'bg-orange-100 text-orange-700' },
  delivered:        { text: 'Đã giao',       color: 'bg-green-100 text-green-700' },
  cancelled:        { text: 'Đã hủy',        color: 'bg-red-100 text-red-600' },
  return_requested: { text: 'Yêu cầu trả',  color: 'bg-pink-100 text-pink-700' },
  returned:         { text: 'Đã trả hàng',  color: 'bg-gray-100 text-gray-600' },
};

const FILTERS = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ xác nhận', value: 'pending' },
  { label: 'Đang giao', value: 'shipping' },
  { label: 'Đã giao', value: 'delivered' },
  { label: 'Đã hủy', value: 'cancelled' },
];

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    getMyOrders(filter ? { status: filter } : {})
      .then((res) => setOrders(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của tôi</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors ${filter === f.value ? 'bg-red-600 text-white border-red-600' : 'text-gray-600 border-gray-200 hover:border-red-300'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !orders.length ? (
        <div className="text-center py-20">
          <ShoppingBag size={56} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium mb-2">Chưa có đơn hàng nào</p>
          <p className="text-gray-400 text-sm mb-6">Hãy mua sắm và quay lại đây để theo dõi đơn hàng</p>
          <Link to="/products" className="btn-primary px-6 py-2.5 rounded-xl">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`}
              className="card p-5 block hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Mã đơn hàng</p>
                  <p className="font-bold text-gray-800">{order.orderCode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS[order.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS[order.status]?.text || order.status}
                  </span>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                </div>
              </div>

              {/* Items preview */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.image || 'https://placehold.co/40x40?text=📱'} alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg border-2 border-white" />
                  ))}
                  {order.items?.length > 3 && (
                    <div className="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {order.items?.length} sản phẩm
                  {order.items?.[0] && ` · ${order.items[0].name}${order.items.length > 1 ? '...' : ''}`}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
                <span className="font-bold text-red-600">{formatPrice(order.totalPrice)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
