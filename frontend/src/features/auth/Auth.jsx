// ============================================
// Auth.jsx - LOGIN & REGISTER PAGE
// Tabs switch between login and sign up forms
// ============================================

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // ProtectedRoute saves where user wanted to go before login (e.g. /cart)
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (tab === 'login') {
        res = await authAPI.login({ email: form.email, password: form.password });
      } else {
        res = await authAPI.register({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      }

      const { token, user } = res.data.data;
      login(token, user); // saves token in localStorage via Redux
      toast.success(tab === 'login' ? 'Welcome back!' : 'Account created successfully!');
      // admins go to dashboard; customers return to page they tried to open
      navigate(user.role === 'admin' ? '/admin' : from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-8"
      >
        <div className="text-center mb-6">
          <span className="text-4xl" role="img" aria-hidden="true">
            🍕
          </span>
          <h1 className="text-2xl font-bold text-neutral-dark mt-2">Pizza Palace</h1>
        </div>

        <div className="flex mb-6 border-b" role="tablist">
          {['login', 'register'].map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 font-semibold capitalize transition-colors ${
                tab === t
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-neutral-dark'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="input-field"
              minLength={6}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Please wait...' : tab === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
