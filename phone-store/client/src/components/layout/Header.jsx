import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Phone, Package, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Realme'];

export default function Header() {
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ngoài
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
    <header className="bg-white shadow-sm sticky top-0 z-50">
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
                className="w-full border border-gray-200 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-red-400"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600">
                <Search size={18} />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-red-600 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600">
                      <Package size={15} /> Đơn hàng của tôi
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 w-full text-left">
                      <LogOut size={15} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors">
                <User size={18} />
                <span className="hidden sm:block">Đăng nhập</span>
              </Link>
            )}

            <Link to="/cart" className="relative">
              <ShoppingCart size={22} className="text-gray-700 hover:text-red-600 transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex gap-6 pb-3 text-sm font-medium text-gray-600">
          {BRANDS.map((brand) => (
            <Link key={brand} to={`/brand/${brand.toLowerCase()}`} className="hover:text-red-600 transition-colors">
              {brand}
            </Link>
          ))}
          <Link to="/products" className="hover:text-red-600 transition-colors">Tất cả sản phẩm</Link>
        </nav>
      </div>
    </header>
  );
}
