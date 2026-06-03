import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import AdminRoute from '@/components/guards/AdminRoute';
import Home from '@/pages/public/Home';
import Menu from '@/pages/public/Menu';
import PizzaDetail from '@/pages/public/PizzaDetail';
import Auth from '@/pages/public/Auth';
import Cart from '@/pages/protected/Cart';
import Checkout from '@/pages/protected/Checkout';
import Orders from '@/pages/protected/Orders';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminPizzas from '@/pages/admin/AdminPizzas';
import AdminOrders from '@/pages/admin/AdminOrders';

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Home />} />
    <Route path="/menu" element={<Menu />} />
    <Route path="/pizza/:id" element={<PizzaDetail />} />
    <Route path="/auth" element={<Auth />} />

    {/* Protected (login required) */}
    <Route
      path="/cart"
      element={
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      }
    />
    <Route
      path="/checkout"
      element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      }
    />
    <Route
      path="/orders"
      element={
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      }
    />

    {/* Admin */}
    <Route
      path="/admin"
      element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/pizzas"
      element={
        <AdminRoute>
          <AdminPizzas />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/orders"
      element={
        <AdminRoute>
          <AdminOrders />
        </AdminRoute>
      }
    />
  </Routes>
);

export default AppRoutes;
