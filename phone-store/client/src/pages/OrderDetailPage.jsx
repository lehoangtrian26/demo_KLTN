import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../api/orders';
import { formatPrice } from '../utils/formatPrice';
import { Package, MapPin, CreditCard, ChevronLeft, X, Phone, Truck, CheckCircle, Clock } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'pending',   label: 'Chờ xác nhận', icon: Clock },
  { key: 'confirmed', label: 'Đã xác nhận',  icon: CheckCircle },
  { key: 'preparing', label: 'Chuẩn bị',     icon: Package },
  { key: 'shipping',  label: 'Đang giao',    icon: Truck },
  { key: 'delivered', label: 'Đã nhận',      icon: CheckCircle },
];

const STATUS_MAP = {
  pending:          { text: 'Chờ xác nhận',  color: 'bg-yellow-100 text-yellow-700' },
  confirmed:        { text: 'Đã xác nhận',   color: 'bg-blue-100 text-blue-700' },
  preparing:        { text: 'Đang chuẩn bị', color: 'bg-purple-100 text-purple-700' },
  shipping:         { text: 'Đang giao',     color: 'bg-orange-100 text-orange-700' },
  delivered:        { text: 'Đã giao',       color: 'bg-green-100 text-green-700' },
  cancelled:        { text: 'Đã hủy',        color: 'bg-red-100 text-red-600' },
  return_requested: { text: 'Yêu cầu trả',  color: 'bg-pink-100 text-pink-700' },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    getOrderById(id)
      .then((res) => setOrder(res.data.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setCancelling(true);
    try {
      const res = await cancelOrder(id, cancelReason);
      setOrder(res.data.data);
      setShowCancel(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === order?.status);
  const isCancelled = order?.status === 'cancelled';
  const canCancel = ['pending', 'confirmed'].includes(order?.status);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="card p-5 animate-pulse h-24" />)}
    </div>
  );

  if (!order) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/orders" className="text-gray-400 hover:text-red-600 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">{order.orderCode}</h1>
          <p className="text-sm text-gray-400">
            {new Date(order.createdAt).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_MAP[order.status]?.color || 'bg-gray-100 text-gray-600'}`}>
          {STATUS_MAP[order.status]?.text || order.status}
        </span>
      </div>

      {/* Timeline trạng thái */}
      {!isCancelled && (
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 z-0" />
            <div className="absolute left-0 top-4 h-0.5 bg-red-500 z-0 transition-all duration-500"
              style={{ width: `${Math.max(0, (currentStepIdx / (STATUS_STEPS.length - 1)) * 100)}%` }} />
            {STATUS_STEPS.map((s, i) => {
              const done = i <= currentStepIdx;
              return (
                <div key={s.key} className="flex flex-col items-center gap-1 z-10 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${done ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                    <s.icon size={14} />
                  </div>
                  <span className={`text-xs text-center leading-tight ${done ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && order.cancelReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
          <span className="font-medium">Lý do hủy:</span> {order.cancelReason}
        </div>
      )}

      {/* Sản phẩm */}
      <div className="card p-5 mb-4">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package size={16} /> Sản phẩm ({order.items?.length})
        </h3>
        <div className="space-y-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-3 items-center">
              <img src={item.image || 'https://placehold.co/64x64?text=📱'} alt={item.name}
                className="w-16 h-16 object-cover rounded-xl" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm line-clamp-2">{item.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.color} · {item.storage}</p>
                <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-gray-800 text-sm">{formatPrice(item.price * item.quantity)}</p>
                <p className="text-xs text-gray-400">{formatPrice(item.price)} / cái</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tổng tiền */}
        <div className="border-t mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Tạm tính</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá</span><span>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>Phí vận chuyển</span>
            <span>{order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Tổng cộng</span>
            <span className="text-red-600">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Địa chỉ + Thanh toán */}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
            <MapPin size={14} /> Địa chỉ giao hàng
          </h3>
          <p className="text-sm text-gray-700 font-medium">{order.shippingAddress?.fullName}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
            <Phone size={12} /> {order.shippingAddress?.phone}
          </p>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {order.shippingAddress?.address}, {order.shippingAddress?.district}, {order.shippingAddress?.city}
          </p>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
            <CreditCard size={14} /> Thanh toán
          </h3>
          <p className="text-sm text-gray-700">
            {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Trạng thái:{' '}
            <span className={order.paymentStatus === 'paid' ? 'text-green-600 font-medium' : 'text-orange-500'}>
              {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </span>
          </p>
          {order.trackingCode && (
            <p className="text-sm text-gray-500 mt-1">Mã vận đơn: <span className="font-medium">{order.trackingCode}</span></p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/products" className="flex-1 btn-outline py-3 rounded-xl font-semibold text-center">
          Tiếp tục mua sắm
        </Link>
        {canCancel && (
          <button onClick={() => setShowCancel(true)}
            className="flex-1 flex items-center justify-center gap-2 border border-red-300 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors">
            <X size={16} /> Hủy đơn hàng
          </button>
        )}
      </div>

      {/* Modal hủy đơn */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCancel(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Hủy đơn hàng</h3>
            <p className="text-gray-500 text-sm mb-4">Vui lòng cho biết lý do hủy đơn hàng <strong>{order.orderCode}</strong>:</p>

            <div className="space-y-2 mb-4">
              {['Tôi muốn thay đổi địa chỉ giao hàng', 'Tôi muốn thay đổi sản phẩm', 'Tìm được giá tốt hơn', 'Lý do khác'].map((r) => (
                <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${cancelReason === r ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="cancelReason" value={r} checked={cancelReason === r} onChange={() => setCancelReason(r)} className="accent-red-600" />
                  <span className="text-sm text-gray-700">{r}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)} className="flex-1 btn-outline py-2.5 rounded-xl">
                Giữ đơn hàng
              </button>
              <button onClick={handleCancel} disabled={!cancelReason || cancelling}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors">
                {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
