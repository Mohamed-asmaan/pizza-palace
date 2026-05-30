import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'pizza_palace_cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (pizza, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.pizza._id === pizza._id);
      if (existing) {
        return prev.map((item) =>
          item.pizza._id === pizza._id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { pizza, qty }];
    });
  };

  const updateQuantity = (pizzaId, qty) => {
    if (qty < 1) {
      removeFromCart(pizzaId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.pizza._id === pizzaId ? { ...item, qty } : item))
    );
  };

  const removeFromCart = (pizzaId) => {
    setItems((prev) => prev.filter((item) => item.pizza._id !== pizzaId));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.pizza.price * item.qty, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
