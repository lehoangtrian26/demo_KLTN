import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, Star, LogOut, Phone, FolderOpen, RotateCcw, Wallet } from 'lucide-react';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Sản phẩm', icon: Package },
  { to: '/admin/categories', label: 'Danh mục', icon: FolderOpen },
  { to: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { to: '/admin/returns', label: 'Trả hàng', icon: RotateCcw },
  { to: '/admin/wallet', label: 'Quản lý Ví', icon: Wallet },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
  { to: '/admin/coupons', label: 'Mã giảm giá', icon: Tag },
  { to: '/admin/reviews', label: 'Đánh giá', icon: Star },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-800">
          <Phone size={20} className="text-red-500" />
          <span className="font-bold text-white text-lg">PhoneStore</span>
        </div>
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-red-600 text-white' : 'hover:bg-gray-800 hover:text-white'}`
              }>
              <n.icon size={18} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-2 truncate">{user.email}</p>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
