import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';

export default function CartPage() {
  const { items, removeItem, updateQty, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const shippingFee = total >= 5000000 ? 0 : 30000;

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  if (!items.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-xl font-semibold text-gray-500 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-400 mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
        <Link to="/products" className="btn-primary px-6 py-2.5 rounded-lg">Mua sắm ngay</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Giỏ hàng <span className="text-gray-400 font-normal text-lg">({items.length} sản phẩm)</span>
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.variantId} className="card p-4 flex gap-4 items-center">
              <Link to={`/products/${item.slug}`} className="shrink-0">
                <img src={item.image || 'https://placehold.co/80x80?text=📱'} alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.slug}`}
                  className="font-medium text-gray-800 hover:text-red-600 line-clamp-2 text-sm">
                  {item.name}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">{item.color} · {item.storage}</p>
                <p className="text-red-600 font-semibold mt-1 text-sm">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => updateQty(item.variantId, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Minus size={13} />
                </button>
                <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                <button onClick={() => updateQty(item.variantId, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Plus size={13} />
                </button>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-gray-800 text-sm">{formatPrice(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item.variantId)}
                  className="text-gray-300 hover:text-red-500 transition-colors mt-1">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Tạm tính ({items.length} sản phẩm)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-gray-400">Miễn phí ship cho đơn từ 5 triệu</p>
              )}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-base mb-4">
              <span>Tổng cộng</span>
              <span className="text-red-600">{formatPrice(total + shippingFee)}</span>
            </div>
            <button onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 btn-primary py-3 rounded-xl font-semibold">
              {user ? 'Tiến hành đặt hàng' : 'Đăng nhập để thanh toán'}
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="card p-4 text-xs text-gray-500 space-y-1.5">
            <p>✅ Bảo hành chính hãng 12 tháng</p>
            <p>✅ Đổi trả miễn phí trong 7 ngày</p>
            <p>✅ Giao hàng toàn quốc</p>
          </div>
        </div>
      </div>
    </div>
  );
}
