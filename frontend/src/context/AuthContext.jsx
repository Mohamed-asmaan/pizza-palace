// ============================================
// AuthContext.jsx - EASY HOOK FOR LOGIN STATE
// Components call useAuth() instead of useSelector directly
// AuthProvider is required in main.jsx (wraps the app)
// ============================================

import { useDispatch, useSelector } from 'react-redux';
import { setAuth, logoutUser, updateAuthUser } from '../store/authSlice';

// no extra UI here - just passes children through
export const AuthProvider = ({ children }) => children;

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  return {
    user,
    loading,
    isAdmin: Boolean(user && user.role === 'admin'),
    isAuthenticated: Boolean(user),
    login: (token, userData) => dispatch(setAuth({ token, user: userData })),
    logout: () => dispatch(logoutUser()),
    updateUser: (userData) => dispatch(updateAuthUser(userData)),
  };
};
