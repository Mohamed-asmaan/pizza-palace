// ============================================
// ProtectedRoute.jsx - LOGIN REQUIRED PAGES
// Used for cart, checkout, orders in App.jsx
// Sends user to /auth if not logged in (remembers where they came from)
// ============================================

import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonLoader count={3} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
