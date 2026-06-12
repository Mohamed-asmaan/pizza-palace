import { useDispatch, useSelector } from 'react-redux';
import { addItem, updateItemQty, removeItem, clearAllItems } from '@/store/cartSlice';

const useCart = () => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);

  // add up the cart total and number of items with a simple loop
  let total = 0;
  let itemCount = 0;
  for (const item of items) {
    total = total + item.pizza.price * item.qty;
    itemCount = itemCount + item.qty;
  }

  return {
    items,
    total,
    itemCount,
    addToCart: (pizza, qty = 1) => dispatch(addItem({ pizza, qty })),
    updateQuantity: (pizzaId, qty) => dispatch(updateItemQty({ pizzaId, qty })),
    removeFromCart: (pizzaId) => dispatch(removeItem(pizzaId)),
    clearCart: () => dispatch(clearAllItems()),
  };
};

export default useCart;
