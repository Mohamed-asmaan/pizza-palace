import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { initializeAuth } from '@/store/authSlice';
import AppRoutes from './AppRoutes';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
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

export default App;
