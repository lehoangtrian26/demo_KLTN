require('dotenv').config();
const mongoose = require('mongoose');
const Phone = require('./models/Phone');

const phones = [
  {
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    brand: 'Apple',
    price: 29990000,
    originalPrice: 34990000,
    images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_1.png'],
    specs: { display: '6.7" Super Retina XDR', chip: 'Apple A17 Pro', ram: '8GB', storage: ['256GB', '512GB', '1TB'], battery: '4422 mAh', camera: '48MP + 12MP + 12MP', os: 'iOS 17' },
    colors: ['Titan Tự Nhiên', 'Titan Đen', 'Titan Trắng', 'Titan Xanh'],
    badge: 'Hot',
    inStock: true,
    rating: 4.9,
    reviewCount: 2341,
    sold: 5200,
  },
  {
    name: 'iPhone 15',
    slug: 'iphone-15',
    brand: 'Apple',
    price: 19990000,
    originalPrice: 22990000,
    images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15_1.png'],
    specs: { display: '6.1" Super Retina XDR', chip: 'Apple A16 Bionic', ram: '6GB', storage: ['128GB', '256GB', '512GB'], battery: '3877 mAh', camera: '48MP + 12MP', os: 'iOS 17' },
    colors: ['Hồng', 'Vàng', 'Xanh lá', 'Đen', 'Xanh dương'],
    badge: 'Sale',
    inStock: true,
    rating: 4.8,
    reviewCount: 1890,
    sold: 4100,
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    brand: 'Samsung',
    price: 31990000,
    originalPrice: 36990000,
    images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-s24-ultra_2.png'],
    specs: { display: '6.8" Dynamic AMOLED 2X', chip: 'Snapdragon 8 Gen 3', ram: '12GB', storage: ['256GB', '512GB', '1TB'], battery: '5000 mAh', camera: '200MP + 12MP + 10MP + 50MP', os: 'Android 14' },
    colors: ['Titan Đen', 'Titan Xám', 'Titan Vàng', 'Titan Tím'],
    badge: 'New',
    inStock: true,
    rating: 4.8,
    reviewCount: 1567,
    sold: 3200,
  },
  {
    name: 'Samsung Galaxy S24+',
    slug: 'samsung-galaxy-s24-plus',
    brand: 'Samsung',
    price: 23990000,
    originalPrice: 27990000,
    images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-s24_1.png'],
    specs: { display: '6.7" Dynamic AMOLED 2X', chip: 'Snapdragon 8 Gen 3', ram: '12GB', storage: ['256GB', '512GB'], battery: '4900 mAh', camera: '50MP + 12MP + 10MP', os: 'Android 14' },
    colors: ['Onyx Black', 'Marble Gray', 'Cobalt Violet', 'Amber Yellow'],
    badge: 'Hot',
    inStock: true,
    rating: 4.7,
    reviewCount: 987,
    sold: 2100,
  },
  {
    name: 'Xiaomi 14 Ultra',
    slug: 'xiaomi-14-ultra',
    brand: 'Xiaomi',
    price: 26990000,
    originalPrice: 29990000,
    images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/x/i/xiaomi-14-ultra_1.png'],
    specs: { display: '6.73" LTPO AMOLED', chip: 'Snapdragon 8 Gen 3', ram: '16GB', storage: ['512GB'], battery: '5000 mAh', camera: '50MP Leica x4 + 50MP + 50MP + 50MP', os: 'Android 14 / HyperOS' },
    colors: ['Đen', 'Trắng'],
    badge: 'New',
    inStock: true,
    rating: 4.7,
    reviewCount: 654,
    sold: 1200,
  },
  {
    name: 'Xiaomi Redmi Note 13 Pro+',
    slug: 'xiaomi-redmi-note-13-pro-plus',
    brand: 'Xiaomi',
    price: 8990000,
    originalPrice: 10990000,
    images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/r/e/redmi-note-13-pro-_1.png'],
    specs: { display: '6.67" AMOLED 120Hz', chip: 'Dimensity 7200 Ultra', ram: '8GB', storage: ['256GB'], battery: '5000 mAh', camera: '200MP + 8MP + 2MP', os: 'Android 13 / MIUI 14' },
    colors: ['Đen', 'Trắng', 'Tím', 'Xanh'],
    badge: 'Best Seller',
    inStock: true,
    rating: 4.6,
    reviewCount: 2100,
    sold: 6800,
  },
  {
    name: 'OPPO Reno 11 Pro',
    slug: 'oppo-reno-11-pro',
    brand: 'OPPO',
    price: 13990000,
    originalPrice: 16990000,
    images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/o/p/oppo-reno11-pro_1.png'],
    specs: { display: '6.7" AMOLED 120Hz', chip: 'Dimensity 8200', ram: '12GB', storage: ['256GB'], battery: '4600 mAh', camera: '50MP + 32MP + 13MP', os: 'Android 14 / ColorOS 14' },
    colors: ['Xanh ngọc', 'Đen'],
    badge: 'Sale',
    inStock: true,
    rating: 4.5,
    reviewCount: 876,
    sold: 1900,
  },
  {
    name: 'Vivo V30',
    slug: 'vivo-v30',
    brand: 'Vivo',
    price: 9990000,
    originalPrice: 11990000,
    images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/v/i/vivo-v30_1.png'],
    specs: { display: '6.78" AMOLED 120Hz', chip: 'Snapdragon 7 Gen 3', ram: '8GB', storage: ['256GB'], battery: '5000 mAh', camera: '50MP + 50MP + 8MP', os: 'Android 14 / Funtouch OS 14' },
    colors: ['Xanh lá', 'Đen', 'Vàng hồng'],
    badge: 'New',
    inStock: true,
    rating: 4.5,
    reviewCount: 543,
    sold: 980,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    await Phone.deleteMany({});
    await Phone.insertMany(phones);
    console.log(`Seeded ${phones.length} phones successfully`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
