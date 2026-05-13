import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import BackToTop from './components/ui/BackToTop';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ui/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import PhoneListPage from './pages/PhoneListPage';
import PhoneDetailPage from './pages/PhoneDetailPage';
import BrandPage from './pages/BrandPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderListPage from './pages/OrderListPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import PaymentReturnPage from './pages/PaymentReturnPage';
import BankTransferPage from './pages/BankTransferPage';
import VNPayPage from './pages/VNPayPage';
import AboutPage from './pages/AboutPage';
import AccessoriesPage from './pages/AccessoriesPage';
import FAQPage from './pages/FAQPage';
import PolicyPage from './pages/PolicyPage';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminReturnsPage from './pages/admin/AdminReturnsPage';
import AdminWalletPage from './pages/admin/AdminWalletPage';

const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Admin routes — không có Header/Footer */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="returns" element={<AdminReturnsPage />} />
              <Route path="wallet" element={<AdminWalletPage />} />
            </Route>

            {/* Public routes — có Header/Footer */}
            <Route path="/*" element={
              <MainLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<PhoneListPage />} />
                  <Route path="/products/:slug" element={<PhoneDetailPage />} />
                  <Route path="/brand/:brand" element={<BrandPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/cart" element={<CartPage />} />

                  <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                  <Route path="/orders/success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><OrderListPage /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                  <Route path="/payment/result" element={<PaymentReturnPage />} />
                  <Route path="/payment/bank-transfer" element={<BankTransferPage />} />
                  <Route path="/payment/vnpay" element={<VNPayPage />} />
                  <Route path="/accessories" element={<AccessoriesPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/policy" element={<PolicyPage />} />
                </Routes>
              </MainLayout>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
      <BackToTop />
      </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
