import { useEffect, useState } from 'react';
import { getAdminOrders, updateOrderStatus } from '../../api/admin';
import { formatPrice } from '../../utils/formatPrice';

const STATUSES = ['', 'pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'];
const STATUS_MAP = {
  pending:   { text: 'Chờ xác nhận',  color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { text: 'Đã xác nhận',   color: 'bg-blue-100 text-blue-700' },
  preparing: { text: 'Đang chuẩn bị', color: 'bg-purple-100 text-purple-700' },
  shipping:  { text: 'Đang giao',     color: 'bg-orange-100 text-orange-700' },
  delivered: { text: 'Đã giao',       color: 'bg-green-100 text-green-700' },
  cancelled: { text: 'Đã hủy',        color: 'bg-red-100 text-red-600' },
};
const NEXT_STATUS = {
  pending: 'confirmed', confirmed: 'preparing', preparing: 'shipping', shipping: 'delivered',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');

  const load = () => {
    setLoading(true);
    getAdminOrders({ status: filter || undefined, q: q || undefined })
      .then((res) => setOrders(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleNext = async (id, nextStatus) => {
    try {
      const res = await updateOrderStatus(id, { status: nextStatus });
      setOrders((prev) => prev.map((o) => o._id === id ? res.data.data : o));
    } catch (err) { alert(err.response?.data?.message); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h1>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${filter === s ? 'bg-red-600 text-white border-red-600' : 'text-gray-600 border-gray-200 hover:border-red-300'}`}>
              {s ? STATUS_MAP[s]?.text : 'Tất cả'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Tìm mã đơn..." className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-400 w-44" />
          <button onClick={load} className="btn-primary px-3 py-1.5 text-sm rounded-lg">Tìm</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Tổng tiền', 'Trạng thái', 'Ngày', 'Hành động'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Đang tải...</td></tr>
            ) : !orders.length ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Không có đơn hàng</td></tr>
            ) : orders.map((o) => (
              <tr key={o._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{o.orderCode}</td>
                <td className="px-4 py-3">
                  <p className="text-gray-800">{o.userId?.name}</p>
                  <p className="text-gray-400 text-xs">{o.userId?.phone}</p>
                </td>
                <td className="px-4 py-3 text-gray-500">{o.items?.length} sản phẩm</td>
                <td className="px-4 py-3 font-semibold text-red-600">{formatPrice(o.totalPrice)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_MAP[o.status]?.color}`}>
                    {STATUS_MAP[o.status]?.text}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3">
                  {NEXT_STATUS[o.status] && (
                    <button onClick={() => handleNext(o._id, NEXT_STATUS[o.status])}
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                      → {STATUS_MAP[NEXT_STATUS[o.status]]?.text}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
