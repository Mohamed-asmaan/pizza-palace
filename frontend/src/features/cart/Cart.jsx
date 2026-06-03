// ============================================
// Cart.jsx - SHOPPING CART PAGE
// Change quantity, remove items, go to checkout
// ============================================

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/format';
import EmptyState from '@/components/ui/EmptyState';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, total } = useCart();

  const handleRemove = (pizzaId, name) => {
    removeFromCart(pizzaId);
    toast.success(`${name} removed from cart`);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Browse our delicious menu and add your favourite pizzas to get started."
          actionLabel="Browse Menu"
          actionLink="/menu"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-neutral-dark mb-8">Your Cart</h1>

      <div className="space-y-4 mb-8">
        {items.map(({ pizza, qty }) => (
          <motion.div
            key={pizza._id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-4 flex gap-4 items-center"
          >
            <img src={pizza.imageUrl} alt={pizza.name} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate">{pizza.name}</h3>
              <p className="text-primary font-semibold">{formatPrice(pizza.price)}</p>
            </div>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                type="button"
                onClick={() => updateQuantity(pizza._id, qty - 1)}
                className="px-3 py-1 hover:bg-gray-100"
                aria-label={`Decrease ${pizza.name} quantity`}
              >
                −
              </button>
              <span className="px-3 py-1 font-semibold">{qty}</span>
              <button
                type="button"
                onClick={() => updateQuantity(pizza._id, qty + 1)}
                className="px-3 py-1 hover:bg-gray-100"
                aria-label={`Increase ${pizza.name} quantity`}
              >
                +
              </button>
            </div>
            <p className="font-bold hidden sm:block w-24 text-right">{formatPrice(pizza.price * qty)}</p>
            <button
              type="button"
              onClick={() => handleRemove(pizza._id, pizza.name)}
              className="text-red-500 hover:text-red-700 p-2"
              aria-label={`Remove ${pizza.name} from cart`}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Order Total</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
        </div>
        <Link to="/checkout" className="btn-primary w-full block text-center">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default Cart;
