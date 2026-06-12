import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { setUser, logoutUser } from '@/store/authSlice';
import { authAPI } from '@/services/api';
import AppRoutes from './AppRoutes';

const App = () => {
  const dispatch = useDispatch();

  // on app load: if a token is saved, ask the backend if it is still valid
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('token');

      // no token saved = user is not logged in
      if (!token) {
        dispatch(setUser(null));
        return;
      }

      try {
        const res = await authAPI.getProfile();
        dispatch(setUser(res.data.data)); // token still valid - stay logged in
      } catch {
        dispatch(logoutUser()); // token expired or invalid - clear login
      }
    };

    checkLogin();
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
};

export default App; //
