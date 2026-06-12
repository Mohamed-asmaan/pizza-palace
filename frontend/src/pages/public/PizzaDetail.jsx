// ============================================
// PizzaDetail.jsx - SINGLE PIZZA PAGE
// URL: /pizza/:id  (id comes from Menu or Home card link)
// Flow: load pizza from API → pick quantity → add to cart (login required)
// ============================================

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { pizzaAPI } from '@/services/api';
import useCart from '@/hooks/useCart';
import useAuth from '@/hooks/useAuth';
import { formatPrice } from '@/utils/format';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

const PizzaDetail = () => {
  const { id } = useParams(); // pizza id from URL
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Redux cart via context hook
  const { isAuthenticated } = useAuth();
  const [pizza, setPizza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // fetch pizza when page opens or when URL id changes
  useEffect(() => {
    const loadPizza = async () => {
      try {
        const res = await pizzaAPI.getById(id);
        setPizza(res.data.data);
      } catch {
        toast.error('Pizza not found');
        navigate('/menu');
      }
      setLoading(false);
    };

    loadPizza();
  }, [id, navigate]);

  const handleAddToCart = () => {
    // cart is stored per user session — must be logged in
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      // after login, send user back to this pizza page
      navigate('/auth', { state: { from: { pathname: `/pizza/${id}` } } });
      return;
    }
    addToCart(pizza, qty); // saves to Redux + localStorage
    toast.success(`${pizza.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonLoader count={1} />
      </div>
    );
  }

  if (!pizza) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <img
          src={pizza.imageUrl}
          alt={pizza.name}
          className="w-full h-80 md:h-96 object-cover rounded-xl shadow-lg"
        />
        <div>
          <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{pizza.category}</span>
          <h1 className="text-3xl font-bold text-neutral-dark mt-3 mb-4">{pizza.name}</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">{pizza.description}</p>
          <p className="text-3xl font-bold text-primary mb-6">{formatPrice(pizza.price)}</p>

          <div className="flex items-center gap-4 mb-6">
            <label htmlFor="quantity" className="font-medium">
              Quantity:
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  if (qty > 1) setQty(qty - 1); // never go below 1
                }}
                className="px-4 py-2 hover:bg-gray-100 rounded-l-lg"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span id="quantity" className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="px-4 py-2 hover:bg-gray-100 rounded-r-lg"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={handleAddToCart} className="btn-primary flex-1">
              Add to Cart — {formatPrice(pizza.price * qty)}
            </button>
            <Link to="/menu" className="btn-secondary text-center flex-1">
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaDetail;
