import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, paymentAPI } from '../services/api';
import { formatPrice } from '../utils/format';
import { loadRazorpayScript, openRazorpayCheckout } from '../utils/razorpay';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    paymentAPI
      .getConfig()
      .then((res) => {
        setPaymentEnabled(res.data.data.enabled);
        setTestMode(res.data.data.testMode);
      })
      .catch(() => {
        setPaymentEnabled(false);
        setTestMode(false);
      });
  }, []);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const orderItems = items.map(({ pizza, qty }) => ({
    pizza: pizza._id,
    qty,
  }));

  const placeCodOrder = async () => {
    await orderAPI.place({
      items: orderItems,
      deliveryAddress: deliveryAddress.trim(),
    });
    clearCart();
    toast.success('Order placed successfully!');
    navigate('/orders');
  };

  const placeRazorpayOrder = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error('Failed to load payment gateway');
      return;
    }

    const paymentOrderRes = await paymentAPI.createOrder({ items: orderItems });
    const { razorpayOrderId, amount, currency, keyId } = paymentOrderRes.data.data;

    const paymentResponse = await openRazorpayCheckout({
      keyId,
      amount,
      currency,
      orderId: razorpayOrderId,
      user,
      onSuccess: (response) => response,
    });

    await paymentAPI.verify({
      items: orderItems,
      deliveryAddress: deliveryAddress.trim(),
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
    });

    clearCart();
    toast.success('Payment successful! Order confirmed.');
    navigate('/orders');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!deliveryAddress.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    setLoading(true);
    try {
      if (paymentEnabled) {
        await placeRazorpayOrder();
      } else {
        await placeCodOrder();
      }
    } catch (err) {
      if (err.message !== 'Payment cancelled') {
        toast.error(err.response?.data?.message || err.message || 'Failed to place order');
      }
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

          <div className="mb-4 rounded-lg bg-gray-50 border border-gray-200 p-4">
            <p className="text-sm font-semibold text-neutral-dark mb-1">Payment</p>
            {testMode && (
              <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2 inline-block">
                Razorpay Test Mode — no real money charged
              </p>
            )}
            <p className="text-sm text-gray-600">
              {paymentEnabled
                ? 'Pay with Razorpay test checkout (UPI, card, netbanking, wallet).'
                : 'Cash on delivery — pay when your order arrives.'}
            </p>
            {testMode && (
              <p className="text-xs text-gray-500 mt-2">
                Test card: 4111 4111 4111 4111 · any future expiry · any CVV
              </p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading
              ? 'Processing...'
              : paymentEnabled
                ? `Pay ${formatPrice(total)} (Test)`
                : 'Place Order'}
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
