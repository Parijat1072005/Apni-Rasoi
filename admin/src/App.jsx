import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore.js';
import { AdminRoute, GuestRoute } from './components/common/ProtectedRoute.jsx';
import PageLoader from './components/common/PageLoader.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import LoginPage      from './pages/LoginPage.jsx';
import DashboardPage  from './pages/DashboardPage.jsx';
import ProductsPage   from './pages/ProductsPage.jsx';
import OrdersPage     from './pages/OrdersPage.jsx';
import UsersPage      from './pages/UsersPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import CouponsPage    from './pages/CouponsPage.jsx';
import ReviewsPage    from './pages/ReviewsPage.jsx';

export default function App() {
  const initialize    = useAuthStore((s) => s.initialize);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => { initialize(); }, []);
  if (!isInitialized) return <PageLoader />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/"           element={<DashboardPage />} />
          <Route path="/products"   element={<ProductsPage />} />
          <Route path="/orders"     element={<OrdersPage />} />
          <Route path="/users"      element={<UsersPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/coupons"    element={<CouponsPage />} />
          <Route path="/reviews"    element={<ReviewsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}