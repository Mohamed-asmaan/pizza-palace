// ============================================
// store.js - REDUX STORE (global state)
// auth = logged-in user
// cart = items in shopping cart
// ============================================

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});
