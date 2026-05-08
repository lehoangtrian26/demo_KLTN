import { Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-4">PhoneStore</h3>
          <p className="text-sm leading-relaxed">Chuyên cung cấp điện thoại chính hãng, giá tốt nhất thị trường. Bảo hành 12 tháng chính hãng.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Thương hiệu</h4>
          <ul className="space-y-2 text-sm">
            {['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Realme'].map((b) => (
              <li key={b}>
                <Link to={`/brand/${b.toLowerCase()}`} className="hover:text-white transition-colors">{b}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Phone size={16} /> 1800 1234</li>
            <li className="flex items-center gap-2"><Mail size={16} /> support@phonestore.vn</li>
            <li className="flex items-center gap-2"><MapPin size={16} /> Số 1 Võ Văn Ngân, Q.Thủ Đức, TP.HCM</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center text-xs py-4 text-gray-500">
        © 2024 PhoneStore. All rights reserved.
      </div>
    </footer>
  );
}
