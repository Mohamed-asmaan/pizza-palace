import { useDispatch, useSelector } from 'react-redux';
import { setAuth, logoutUser } from '@/store/authSlice';

const useAuth = () => {
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
  };
};

export default useAuth;
