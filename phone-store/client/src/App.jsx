import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ui/ProtectedRoute';

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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<PhoneListPage />} />
                <Route path="/products/:slug" element={<PhoneDetailPage />} />
                <Route path="/brand/:brand" element={<BrandPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* Protected routes */}
                <Route path="/checkout" element={
                  <ProtectedRoute><CheckoutPage /></ProtectedRoute>
                } />
                <Route path="/orders/success" element={
                  <ProtectedRoute><OrderSuccessPage /></ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute><OrderListPage /></ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
