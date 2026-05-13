import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Phone, Package, LogOut, ChevronDown, Heart, LayoutDashboard, UserCircle, Sun, Moon } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Realme'];

export default function Header() {
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center gap-4 h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-red-600 shrink-0">
            <Phone size={22} />
            PhoneStore
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm điện thoại..."
                className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-red-400"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600">
                <Search size={18} />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3 shrink-0">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              aria-label="Chuyển chế độ tối/sáng"
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200 hover:text-red-600 transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-red-200" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 font-bold text-xs">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600">
                      <UserCircle size={15} /> Tài khoản
                    </Link>
                    <Link to="/orders" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600">
                      <Package size={15} /> Đơn hàng của tôi
                    </Link>
                    <Link to="/wishlist" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600">
                      <Heart size={15} /> Yêu thích
                    </Link>
                    {user?.role === 'admin' && (
                      <>
                        <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                        <Link to="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium">
                          <LayoutDashboard size={15} /> Admin Dashboard
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 w-full text-left">
                      <LogOut size={15} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors">
                <User size={18} />
                <span className="hidden sm:block">Đăng nhập</span>
              </Link>
            )}

            <Link to="/cart" className="relative">
              <ShoppingCart size={22} className="text-gray-700 dark:text-gray-200 hover:text-red-600 transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex gap-6 pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
          {BRANDS.map((brand) => (
            <Link key={brand} to={`/brand/${brand.toLowerCase()}`} className="hover:text-red-600 transition-colors">
              {brand}
            </Link>
          ))}
          <Link to="/products" className="hover:text-red-600 transition-colors">Tất cả sản phẩm</Link>
          <Link to="/accessories" className="hover:text-red-600 transition-colors">Phụ kiện</Link>
        </nav>
      </div>
    </header>
  );
}
