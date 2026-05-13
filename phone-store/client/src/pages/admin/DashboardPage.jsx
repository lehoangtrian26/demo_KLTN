import { useEffect, useState } from 'react';
import { getDashboard } from '../../api/admin';
import { formatPrice } from '../../utils/formatPrice';
import { Users, Package, ShoppingBag, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const STATUS_MAP = {
  pending: { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  shipping: { text: 'Đang giao', color: 'bg-orange-100 text-orange-700' },
  delivered: { text: 'Đã giao', color: 'bg-green-100 text-green-700' },
  cancelled: { text: 'Đã hủy', color: 'bg-red-100 text-red-600' },
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then((res) => setData(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-400">Đang tải...</div>;
  if (!data) return <div className="p-8 text-red-500">Không thể tải dữ liệu</div>;

  const { stats, thisMonth, lastMonth, revenueGrowth, last7Days, recentOrders, topProducts } = data;

  const STAT_CARDS = [
    { label: 'Doanh thu tháng này', value: formatPrice(thisMonth.revenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', growth: revenueGrowth },
    { label: 'Đơn hàng tháng này', value: thisMonth.orders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tổng người dùng', value: stats.totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Đơn chờ xử lý', value: stats.pendingOrders, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const chartData = last7Days.map((d) => ({
    date: d._id.slice(5), // MM-DD
    revenue: d.revenue,
    orders: d.orders,
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Tổng quan hoạt động kinh doanh</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{s.label}</p>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            {s.growth !== undefined && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${s.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {s.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(s.growth)}% so với tháng trước
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Chart doanh thu 7 ngày */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Doanh thu 7 ngày gần nhất</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E53E3E" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#E53E3E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => (v / 1e6).toFixed(0) + 'M'} />
            <Tooltip formatter={(v) => formatPrice(v)} labelFormatter={(l) => `Ngày ${l}`} />
            <Area type="monotone" dataKey="revenue" stroke="#E53E3E" strokeWidth={2} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Đơn hàng gần đây */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Đơn hàng gần đây</h3>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{o.orderCode}</p>
                  <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_MAP[o.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_MAP[o.status]?.text || o.status}
                  </span>
                  <span className="text-sm font-bold text-red-600">{formatPrice(o.totalPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top sản phẩm */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Bán chạy nhất</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="w-6 text-sm font-bold text-gray-400">#{i + 1}</span>
                <img src={p.images?.[0] || 'https://placehold.co/40x40'} alt={p.name}
                  className="w-10 h-10 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">Đã bán: {p.sold?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
