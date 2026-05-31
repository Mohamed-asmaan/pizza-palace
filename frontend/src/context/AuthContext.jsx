// ============================================
// AuthContext.jsx - KEEPS LOGGED IN USER INFO
// saves token in localStorage so refresh still logged in
// useAuth() hook used in Navbar, Checkout, etc
// ============================================

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // load user from browser storage on page load
  const [user, setUser] = useState(function () {
    var stored = localStorage.getItem('user');
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // if token exists, get fresh user data from backend
  useEffect(function () {
    var token = localStorage.getItem('token');
    if (token) {
      authAPI
        .getProfile()
        .then(function (res) {
          setUser(res.data.data);
          localStorage.setItem('user', JSON.stringify(res.data.data));
        })
        .catch(function () {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(function () {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // called after login or register
  const login = function (token, userData) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = function () {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = function (userData) {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  var isAdmin = user && user.role === 'admin';
  var isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{ user: user, loading: loading, login: login, logout: logout, updateUser: updateUser, isAdmin: isAdmin, isAuthenticated: isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = function () {
  var context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
