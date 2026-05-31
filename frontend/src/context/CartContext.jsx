// ============================================
// CartContext.jsx - SHOPPING CART (saved in browser)
// addToCart, removeFromCart, total price
// ============================================

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
var CART_KEY = 'pizza_palace_cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(function () {
    var saved = localStorage.getItem(CART_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  // save cart whenever it changes
  useEffect(function () {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = function (pizza, qty) {
    if (!qty) qty = 1;
    setItems(function (prev) {
      var found = false;
      var newItems = [];
      for (var i = 0; i < prev.length; i++) {
        if (prev[i].pizza._id === pizza._id) {
          newItems.push({ pizza: prev[i].pizza, qty: prev[i].qty + qty });
          found = true;
        } else {
          newItems.push(prev[i]);
        }
      }
      if (!found) {
        newItems.push({ pizza: pizza, qty: qty });
      }
      return newItems;
    });
  };

  const updateQuantity = function (pizzaId, qty) {
    if (qty < 1) {
      removeFromCart(pizzaId);
      return;
    }
    setItems(function (prev) {
      return prev.map(function (item) {
        if (item.pizza._id === pizzaId) {
          return { pizza: item.pizza, qty: qty };
        }
        return item;
      });
    });
  };

  const removeFromCart = function (pizzaId) {
    setItems(function (prev) {
      return prev.filter(function (item) {
        return item.pizza._id !== pizzaId;
      });
    });
  };

  const clearCart = function () {
    setItems([]);
  };

  // calculate total price
  var total = 0;
  var itemCount = 0;
  for (var j = 0; j < items.length; j++) {
    total = total + items[j].pizza.price * items[j].qty;
    itemCount = itemCount + items[j].qty;
  }

  return (
    <CartContext.Provider
      value={{
        items: items,
        addToCart: addToCart,
        updateQuantity: updateQuantity,
        removeFromCart: removeFromCart,
        clearCart: clearCart,
        total: total,
        itemCount: itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = function () {
  var context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
};
