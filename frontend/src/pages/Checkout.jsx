import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';
import { formatPrice } from '../utils/format';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!deliveryAddress.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map(({ pizza, qty }) => ({
        pizza: pizza._id,
        qty,
      }));

      await orderAPI.place({
        items: orderItems,
        deliveryAddress: deliveryAddress.trim(),
      });

      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-neutral-dark mb-8">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handlePlaceOrder}
          className="card p-6"
        >
          <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Enter your full delivery address..."
            className="input-field min-h-[120px] resize-y mb-4"
            required
            aria-label="Delivery address"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
          <Link to="/cart" className="block text-center text-primary mt-3 hover:underline">
            ← Back to Cart
          </Link>
        </motion.form>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map(({ pizza, qty }) => (
              <div key={pizza._id} className="flex justify-between text-sm">
                <span>
                  {pizza.name} × {qty}
                </span>
                <span className="font-semibold">{formatPrice(pizza.price * qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
