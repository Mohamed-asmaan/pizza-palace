// ============================================
// authSlice.js - LOGIN STATE (Redux)
// Saves token + user in localStorage so refresh keeps you logged in
// App.jsx checks the saved token with the backend on first load
// ============================================

import { createSlice } from '@reduxjs/toolkit';

// read user from browser storage on first load
const getStoredUser = () => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getStoredUser(),
    loading: true, // true until App.jsx finishes checking the saved token
  },
  reducers: {
    // after login or register
    setAuth: (state, action) => {
      const { token, user } = action.payload;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      state.user = user;
      state.loading = false;
    },
    // App.jsx calls this after the backend confirms the saved token is still good
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
      state.loading = false;
    },
    logoutUser: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.loading = false;
    },
  },
});

export const { setAuth, setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
