import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import AdminRoute from '@/components/guards/AdminRoute';
import Home from '@/features/catalog/Home';
import Menu from '@/features/catalog/Menu';
import PizzaDetail from '@/features/catalog/PizzaDetail';
import Auth from '@/features/auth/Auth';
import Cart from '@/features/cart/Cart';
import Checkout from '@/features/cart/Checkout';
import Orders from '@/features/orders/Orders';
import AdminDashboard from '@/features/admin/AdminDashboard';
import AdminPizzas from '@/features/admin/AdminPizzas';
import AdminOrders from '@/features/admin/AdminOrders';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/menu" element={<Menu />} />
    <Route path="/pizza/:id" element={<PizzaDetail />} />
    <Route path="/auth" element={<Auth />} />

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
