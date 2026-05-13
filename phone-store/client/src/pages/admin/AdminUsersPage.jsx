import { useEffect, useState } from 'react';
import { getAdminUsers, toggleUserStatus } from '../../api/admin';
import { adminTopupWallet } from '../../api/wallet';
import { formatPrice } from '../../utils/formatPrice';
import { Wallet, X } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [topupTarget, setTopupTarget] = useState(null); // user được nạp ví
  const [topupAmount, setTopupAmount] = useState('');
  const [topupDesc, setTopupDesc] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);

  const load = (query = '') => {
    setLoading(true);
    getAdminUsers({ q: query || undefined })
      .then((res) => setUsers(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    try {
      const res = await toggleUserStatus(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: res.data.data.isActive } : u));
    } catch (err) { alert(err.response?.data?.message); }
  };

  const handleTopup = async () => {
    const amount = Number(topupAmount);
    if (!amount || amount <= 0) { alert('Vui lòng nhập số tiền hợp lệ'); return; }
    setTopupLoading(true);
    try {
      const res = await adminTopupWallet({ userId: topupTarget._id, amount, description: topupDesc || undefined });
      alert(res.data.message);
      setTopupTarget(null);
      setTopupAmount('');
      setTopupDesc('');
      load(q); // Reload danh sách để cập nhật walletBalance mới
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setTopupLoading(false); }
  };

  const TIER_COLOR = { bronze: 'text-orange-600 bg-orange-50', silver: 'text-gray-600 bg-gray-100', gold: 'text-yellow-600 bg-yellow-50', platinum: 'text-blue-600 bg-blue-50' };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý người dùng</h1>
      <div className="flex gap-3 mb-5">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(q)}
          placeholder="Tìm tên hoặc email..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
        <button onClick={() => load(q)} className="btn-primary px-4 py-2 text-sm rounded-lg">Tìm</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Người dùng', 'Email', 'SĐT', 'Hạng', 'Số dư ví', 'Trạng thái', 'Hành động'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Đang tải...</td></tr>
            ) : !users.length ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Không có người dùng</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_COLOR[u.memberTier] || ''}`}>
                    {u.memberTier?.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-green-600">{formatPrice(u.walletBalance || 0)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => { setTopupTarget(u); setTopupAmount(''); setTopupDesc(''); }}
                      className="text-xs bg-green-50 text-green-600 px-2 py-1.5 rounded-lg hover:bg-green-100 flex items-center gap-1">
                      <Wallet size={11} /> Nạp ví
                    </button>
                    <button onClick={() => handleToggle(u._id)}
                      className={`text-xs px-2 py-1.5 rounded-lg font-medium transition-colors ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {u.isActive ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nạp ví */}
      {topupTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setTopupTarget(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Wallet size={18} className="text-green-600" /> Nạp tiền vào ví
              </h3>
              <button onClick={() => setTopupTarget(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
              <p className="text-gray-500">Người dùng: <span className="font-medium text-gray-800">{topupTarget.name}</span></p>
              <p className="text-gray-500">Số dư hiện tại: <span className="font-medium text-green-600">{formatPrice(topupTarget.walletBalance || 0)}</span></p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Số tiền nạp (VND) *</label>
                <input type="number" min={1000} value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="VD: 100000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                {topupAmount && Number(topupAmount) > 0 && (
                  <p className="text-xs text-green-600 mt-1">= {formatPrice(Number(topupAmount))}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Ghi chú (tùy chọn)</label>
                <input value={topupDesc} onChange={(e) => setTopupDesc(e.target.value)}
                  placeholder="VD: Bồi thường sự cố, thưởng khách hàng..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setTopupTarget(null)} className="flex-1 border border-gray-200 py-2 rounded-xl text-gray-600 text-sm hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleTopup} disabled={topupLoading || !topupAmount}
                className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {topupLoading ? 'Đang nạp...' : 'Nạp tiền'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
