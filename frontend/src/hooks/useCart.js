import { useDispatch, useSelector } from 'react-redux';
import { addItem, updateItemQty, removeItem, clearAllItems } from '@/store/cartSlice';

const useCart = () => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);

  const total = items.reduce((sum, item) => sum + item.pizza.price * item.qty, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

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
