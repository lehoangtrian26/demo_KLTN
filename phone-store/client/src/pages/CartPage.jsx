import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import { validateCoupon } from '../api/coupons';

export default function CartPage() {
  const { items, removeItem, updateQty, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  const shippingFee = total >= 5000000 ? 0 : 30000;
  const discount = coupon?.discountAmount || 0;
  const grandTotal = total + shippingFee - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponError('');
    try {
      const res = await validateCoupon(couponCode.trim(), total);
      setCoupon(res.data.data);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Mã không hợp lệ');
      setCoupon(null);
    } finally { setApplying(false); }
  };

  const handleCheckout = () => {
    if (!user) navigate('/login', { state: { from: '/checkout' } });
    else navigate('/checkout', { state: { coupon } });
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
                <Link to={`/products/${item.slug}`} className="font-medium text-gray-800 hover:text-red-600 line-clamp-2 text-sm">
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
                <button onClick={() => removeItem(item.variantId)} className="text-gray-300 hover:text-red-500 transition-colors mt-1">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Tag size={16} className="text-red-500" /> Mã giảm giá
            </h3>
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <div>
                  <p className="text-sm font-bold text-green-700 font-mono">{coupon.code}</p>
                  <p className="text-xs text-green-600">Giảm {formatPrice(coupon.discountAmount)}</p>
                </div>
                <button onClick={() => { setCoupon(null); setCouponCode(''); }} className="text-green-500 hover:text-red-500">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Nhập mã..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 uppercase" />
                  <button onClick={handleApplyCoupon} disabled={applying}
                    className="btn-primary px-3 py-2 text-sm rounded-lg disabled:opacity-60 shrink-0">
                    {applying ? '...' : 'Áp dụng'}
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
              </div>
            )}
          </div>

          {/* Order total */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Tạm tính ({items.length} sản phẩm)</span>
                <span>{formatPrice(total)}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Giảm giá ({coupon.code})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                </span>
              </div>
              {shippingFee > 0 && <p className="text-xs text-gray-400">Miễn phí ship cho đơn từ 5 triệu</p>}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-base mb-4">
              <span>Tổng cộng</span>
              <span className="text-red-600">{formatPrice(grandTotal)}</span>
            </div>
            <button onClick={handleCheckout} className="w-full flex items-center justify-center gap-2 btn-primary py-3 rounded-xl font-semibold">
              {user ? 'Tiến hành đặt hàng' : 'Đăng nhập để thanh toán'} <ArrowRight size={16} />
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
