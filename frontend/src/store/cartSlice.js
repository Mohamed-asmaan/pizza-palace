import { createSlice } from '@reduxjs/toolkit';

const CART_KEY = 'pizza_palace_cart';

const getStoredCart = () => {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: getStoredCart(),
  },
  reducers: {
    addItem: (state, action) => {
      const { pizza, qty = 1 } = action.payload;
      const existing = state.items.find((it) => it.pizza._id === pizza._id);
      if (existing) {
        existing.qty += qty;
      } else {
        state.items.push({ pizza, qty });
      }
      saveCart(state.items);
    },
    updateItemQty: (state, action) => {
      const { pizzaId, qty } = action.payload;
      if (qty < 1) {
        state.items = state.items.filter((it) => it.pizza._id !== pizzaId);
      } else {
        const item = state.items.find((it) => it.pizza._id === pizzaId);
        if (item) item.qty = qty;
      }
      saveCart(state.items);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((it) => it.pizza._id !== action.payload);
      saveCart(state.items);
    },
    clearAllItems: (state) => {
      state.items = [];
      saveCart(state.items);
    },
  },
});

export const { addItem, updateItemQty, removeItem, clearAllItems } = cartSlice.actions;
export default cartSlice.reducer;
