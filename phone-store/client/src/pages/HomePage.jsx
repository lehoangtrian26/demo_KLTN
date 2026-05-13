import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts, getProducts } from '../api/products';
import PhoneCard from '../components/phone/PhoneCard';
import PhoneGrid from '../components/phone/PhoneGrid';
import { ChevronRight, ChevronLeft, Flame, Sparkles, Tag, Headphones } from 'lucide-react';

/* ── Dữ liệu tĩnh ─────────────────────────────────────── */

const BRANDS = [
  { name: 'Apple',   slug: 'apple',   emoji: '🍎' },
  { name: 'Samsung', slug: 'samsung', emoji: '🌌' },
  { name: 'Xiaomi',  slug: 'xiaomi',  emoji: '📱' },
  { name: 'OPPO',    slug: 'oppo',    emoji: '📷' },
  { name: 'Vivo',    slug: 'vivo',    emoji: '🎵' },
  { name: 'Realme',  slug: 'realme',  emoji: '⚡' },
];

const SLIDES = [
  {
    tag: 'Bán chạy nhất 2024',
    title: 'Điện Thoại Chính Hãng\nGiá Tốt Nhất',
    desc: 'Bảo hành 12 tháng · Giao hàng toàn quốc · Trả góp 0%',
    cta: 'Mua ngay',
    link: '/products',
    from: '#E53E3E',
    to: '#C53030',
    emoji: '📱',
  },
  {
    tag: 'iPhone Series',
    title: 'iPhone 15 & 16\nSiêu Khuyến Mãi',
    desc: 'Giảm đến 2 triệu · Tặng AirPods · Bảo hiểm miễn phí 1 năm',
    cta: 'Xem iPhone',
    link: '/brand/apple',
    from: '#1a1a2e',
    to: '#16213e',
    emoji: '🍎',
  },
  {
    tag: 'Samsung Galaxy',
    title: 'Galaxy S24 Series\nƯu Đãi Đặc Biệt',
    desc: 'Giảm đến 3 triệu · Tặng Galaxy Buds · Đổi máy cũ lấy mới',
    cta: 'Xem Samsung',
    link: '/brand/samsung',
    from: '#1565C0',
    to: '#0D47A1',
    emoji: '🌌',
  },
];

/* ── Components nhỏ ────────────────────────────────────── */

function SectionHeader({ icon: Icon, iconColor, title, link }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <Icon size={20} className={iconColor} />
        {title}
      </h2>
      <Link to={link} className="flex items-center gap-1 text-sm text-red-600 hover:underline font-medium">
        Xem tất cả <ChevronRight size={16} />
      </Link>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */

export default function HomePage() {
  /* Carousel */
  const [slide, setSlide]   = useState(0);
  const timerRef            = useRef(null);

  /* Products */
  const [hot, setHot]             = useState([]);
  const [newest, setNewest]       = useState([]);
  const [sale, setSale]           = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading]     = useState(true);

  /* Auto-play */
  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setSlide((s) => (s + 1) % SLIDES.length),
      4500
    );
  };
  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, []);

  const goSlide = (i) => { setSlide(i); startTimer(); };
  const prevSlide = () => goSlide((slide - 1 + SLIDES.length) % SLIDES.length);
  const nextSlide = () => goSlide((slide + 1) % SLIDES.length);

  /* Fetch products */
  useEffect(() => {
    Promise.all([
      getFeaturedProducts(),
      getProducts({ sort: 'newest', limit: 8 }),
      getProducts({ sort: 'popular', limit: 4, category: 'tai-nghe' }),
      getProducts({ sort: 'popular', limit: 4, category: 'sac-nhanh' }),
    ]).then(([hotRes, newRes, headRes, chargerRes]) => {
      const hotData  = hotRes.data.data  || [];
      const newData  = newRes.data.data  || [];
      setHot(hotData);
      setNewest(newData);
      setSale(hotData.filter((p) => p.cheapestVariant?.salePrice));
      setAccessories([...(headRes.data.data || []), ...(chargerRes.data.data || [])]);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-12">

      {/* ── Hero Carousel ──────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden select-none">
        <div className="h-52 md:h-72" /> {/* height placeholder */}

        {SLIDES.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center px-8 md:px-14 transition-opacity duration-700"
            style={{
              background: `linear-gradient(135deg, ${s.from}, ${s.to})`,
              opacity: i === slide ? 1 : 0,
              pointerEvents: i === slide ? 'auto' : 'none',
            }}
          >
            <div className="text-white flex-1">
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full mb-3 inline-block">
                {s.tag}
              </span>
              <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-3 whitespace-pre-line">
                {s.title}
              </h1>
              <p className="text-white/80 text-sm mb-5 hidden md:block">{s.desc}</p>
              <Link
                to={s.link}
                className="bg-white text-gray-900 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors inline-block text-sm"
              >
                {s.cta}
              </Link>
            </div>
            <div className="text-8xl md:text-9xl hidden sm:block select-none">{s.emoji}</div>
          </div>
        ))}

        {/* Prev / Next */}
        <button onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors">
          <ChevronLeft size={18} />
        </button>
        <button onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors">
          <ChevronRight size={18} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goSlide(i)}
              className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
          ))}
        </div>
      </div>

      {/* ── Thương hiệu ─────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Thương hiệu nổi bật</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {BRANDS.map((b) => (
            <Link key={b.slug} to={`/brand/${b.slug}`}
              className="card p-4 flex flex-col items-center gap-2 hover:border hover:border-red-200 hover:shadow-md transition-all">
              <span className="text-3xl">{b.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{b.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Đang giảm giá ───────────────────────────────────── */}
      {(loading || sale.length > 0) && (
        <section>
          <SectionHeader icon={Tag} iconColor="text-orange-500" title="Đang giảm giá" link="/products?sort=popular" />
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map((i) => <div key={i} className="card animate-pulse aspect-[3/4]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sale.slice(0, 4).map((p) => <PhoneCard key={p._id} phone={p} />)}
            </div>
          )}
        </section>
      )}

      {/* ── Sản phẩm Hot ────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Flame} iconColor="text-red-500" title="Sản phẩm bán chạy" link="/products?sort=popular" />
        <PhoneGrid phones={hot} loading={loading} />
      </section>

      {/* ── Promo banner ────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-2xl p-5 flex items-center gap-4">
          <span className="text-4xl">💳</span>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Trả góp 0%</h3>
            <p className="text-sm text-gray-500">Lên đến 24 tháng, không cần chứng minh thu nhập</p>
          </div>
        </div>
        <div className="bg-green-50 rounded-2xl p-5 flex items-center gap-4">
          <span className="text-4xl">🔄</span>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Thu cũ đổi mới</h3>
            <p className="text-sm text-gray-500">Định giá minh bạch, hỗ trợ tối đa</p>
          </div>
        </div>
        <div className="bg-purple-50 rounded-2xl p-5 flex items-center gap-4">
          <span className="text-4xl">🚀</span>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Giao hàng nhanh</h3>
            <p className="text-sm text-gray-500">Nội thành trong ngày, toàn quốc 1–3 ngày</p>
          </div>
        </div>
      </div>

      {/* ── Mới ra mắt ──────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Sparkles} iconColor="text-purple-500" title="Mới ra mắt" link="/products?sort=newest" />
        <PhoneGrid phones={newest} loading={loading} />
      </section>

      {/* ── Phụ kiện nổi bật ─────────────────────────────── */}
      {(loading || accessories.length > 0) && (
        <section>
          <SectionHeader icon={Headphones} iconColor="text-blue-500" title="Phụ kiện nổi bật" link="/accessories" />
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map((i) => <div key={i} className="card animate-pulse aspect-[3/4]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {accessories.slice(0, 4).map((p) => <PhoneCard key={p._id} phone={p} />)}
            </div>
          )}
        </section>
      )}

    </div>
  );
}
