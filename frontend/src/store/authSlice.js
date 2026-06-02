// ============================================
// authSlice.js - LOGIN STATE (Redux)
// Saves token + user in localStorage so refresh keeps you logged in
// initializeAuth runs on app load (see App.jsx)
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../services/api';

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

// called once when app opens - validates token with backend
export const initializeAuth = createAsyncThunk('auth/initialize', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return { user: null };
  }

  try {
    const res = await authAPI.getProfile();
    return { user: res.data.data };
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Session expired');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getStoredUser(),
    loading: true, // true until initializeAuth finishes
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
    logoutUser: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.loading = false;
    },
    updateAuthUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        if (action.payload.user) {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        // bad or expired token - clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        state.user = null;
        state.loading = false;
      });
  },
});

export const { setAuth, logoutUser, updateAuthUser } = authSlice.actions;
export default authSlice.reducer;
