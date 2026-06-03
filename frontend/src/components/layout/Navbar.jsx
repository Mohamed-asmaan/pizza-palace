// ============================================
// Navbar.jsx - TOP NAVIGATION (shown on every page via App.jsx)
// Shows different links for guest vs customer vs admin
// Cart icon only appears when logged in (cart needs account)
// ============================================

import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '@/hooks/useAuth';
import useCart from '@/hooks/useCart';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();

  // highlight the link for the current page
  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-primary text-white' : 'text-neutral-dark hover:bg-gray-100'
    }`;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2" aria-label="Pizza Palace Home">
          <span className="text-2xl" role="img" aria-hidden="true">
            🍕
          </span>
          <span className="text-xl font-bold text-primary">Pizza Palace</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/menu" className={navLinkClass}>
            Menu
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/orders" className={navLinkClass}>
                Orders
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Link
              to="/cart"
              className="relative p-2 rounded-lg hover:bg-gray-100"
              aria-label={`Cart with ${itemCount} items`}
            >
              <span className="text-xl" role="img" aria-hidden="true">
                🛒
              </span>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-gray-600">Hi, {user?.name?.split(' ')[0]}</span>
              <button onClick={logout} className="text-sm font-medium text-primary hover:underline" type="button">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn-primary text-sm">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
