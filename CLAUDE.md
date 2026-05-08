# Phone Store Website

## Project Overview

A modern, minimalist e-commerce website showcasing and selling smartphones. The design is clean, professional, and user-friendly — inspired by Vietnamese phone retail sites but with a more refined, contemporary aesthetic.

## Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Routing:** React Router v6
- **State:** React hooks + Context API
- **HTTP Client:** Axios
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **File Upload:** Multer (phone images)
- **Validation:** express-validator
- **Env:** dotenv

### Project Structure
```
/
├── client/          # React frontend (Vite)
└── server/          # Node.js + Express backend
```

## Design System

### Color Palette
- **Primary:** Red — `#E53E3E` / `red-600` (CTAs, badges, accents)
- **Background:** White `#FFFFFF` and Light Gray `#F7F7F7`
- **Text Primary:** `#1A1A1A`
- **Text Secondary:** `#6B7280`
- **Border:** `#E5E7EB`

### Typography
- **Font:** Inter (Google Fonts)
- **Heading scale:** text-2xl → text-4xl, font-bold
- **Body:** text-sm / text-base, font-normal
- **Price:** text-lg, font-semibold, text-red-600

### Spacing & Layout
- Max content width: `1200px` centered
- Section padding: `py-10 px-4`
- Card gap: `gap-4`
- Responsive grid: 2 cols (mobile) → 4 cols (desktop)

### Component Style Rules
- Cards: white background, subtle shadow (`shadow-sm`), rounded-xl, hover lift effect
- Buttons: rounded-lg, solid red primary, ghost secondary
- No heavy gradients — flat and clean
- Badges (e.g. "Sale", "New"): pill shape, red or gray

## Site Structure

```
/                    → Homepage (hero banner + featured phones + categories)
/phones              → All phones listing with filter/sort
/phones/[slug]       → Phone detail page
/brand/[brand]       → Phones by brand (Apple, Samsung, Xiaomi, OPPO…)
/cart                → Shopping cart
/search              → Search results
```

## Key Sections (Homepage)

1. **Header** — Logo, search bar, cart icon, nav links
2. **Hero Banner** — Full-width promotional banner (carousel, 3 slides)
3. **Brand Logos** — Quick filter: Apple | Samsung | Xiaomi | OPPO | Vivo | Realme
4. **Featured Phones** — Horizontal scroll or 4-col grid, top-selling models
5. **Category Highlight** — iPhone / Android / Budget / Gaming phones
6. **Promotions Banner** — Secondary banner (installment offer, trade-in)
7. **New Arrivals** — Latest models grid
8. **Footer** — Links, hotline, social media, address

## Data Model

```typescript
interface Phone {
  id: string
  slug: string
  name: string
  brand: string        // "Apple" | "Samsung" | "Xiaomi" | ...
  price: number        // VND
  originalPrice?: number
  images: string[]
  specs: {
    display: string
    chip: string
    ram: string
    storage: string[]
    battery: string
    camera: string
  }
  colors: string[]
  badge?: "New" | "Hot" | "Sale" | "Best Seller"
  inStock: boolean
  rating: number
  reviewCount: number
}
```

## Development Conventions

- Use Vietnamese for all user-facing text (prices in VND, e.g. `12.990.000đ`)
- Phone data served from Express API, seeded via `server/seed.js`
- Components in `client/src/components/`, grouped by feature: `ui/`, `layout/`, `phone/`, `cart/`
- API calls centralized in `client/src/api/` (one file per resource: `phones.js`, `auth.js`, `orders.js`)
- No inline styles — Tailwind classes only
- Image alt text must be descriptive
- Mobile-first responsive design
- Accessibility: semantic HTML, aria-labels on icon buttons

## API Endpoints (Express)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/phones` | List phones (filter, sort, paginate) |
| GET | `/api/phones/:slug` | Phone detail |
| GET | `/api/phones/brand/:brand` | Phones by brand |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/cart` | Get cart (auth) |
| POST | `/api/orders` | Place order (auth) |
| POST | `/api/admin/phones` | Add phone (admin) |
| PUT | `/api/admin/phones/:id` | Update phone (admin) |

## Commands

```bash
# Root
npm run dev          # Start both client + server concurrently

# Server (cd server)
npm run dev          # nodemon server.js (port 5000)
npm run seed         # Seed MongoDB with sample phones

# Client (cd client)
npm run dev          # Vite dev server (port 5173)
npm run build        # Production build
npm run lint         # ESLint check
```

## Naming Conventions

- Components: PascalCase (`PhoneCard.jsx`)
- Hooks: camelCase with `use` prefix (`useCart.js`)
- Utils: camelCase (`formatPrice.js`)
- Routes/pages: kebab-case paths

## Environment Variables

```env
# server/.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/phonestore
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

# client/.env
VITE_API_URL=http://localhost:5000/api
```

## Performance Notes

- Lazy load images below the fold (`loading="lazy"`)
- Paginate API results (default 20 per page)
- MongoDB indexes on `brand`, `slug`, `price`
- Keep bundle size lean — avoid heavy third-party libs
