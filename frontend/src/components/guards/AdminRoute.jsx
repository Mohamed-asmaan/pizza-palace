// ============================================
// AdminRoute.jsx - BLOCKS NON-ADMIN USERS
// Wrap admin pages in App.jsx: <AdminRoute><AdminDashboard /></AdminRoute>
// ============================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

const AdminRoute = ({ children }) => {
  const { isAdmin, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonLoader count={3} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
