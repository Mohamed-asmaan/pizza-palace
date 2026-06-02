// ============================================
// Home.jsx - LANDING PAGE
// Shows hero banner + 4 featured pizzas from API
// ============================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pizzaAPI } from '../services/api';
import PizzaCard from '../components/PizzaCard';
import SkeletonLoader from '../components/SkeletonLoader';

const Home = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);

  // home page only shows 4 featured pizzas, not the full menu
  useEffect(() => {
    pizzaAPI
      .getAll()
      .then((res) => setPizzas(res.data.data.slice(0, 4)))
      .catch(() => setPizzas([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Fresh Pizzas, Delivered Hot
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Browse our handcrafted pizza catalogue, customise your order, and track delivery — all from one place.
            </p>
            <Link to="/menu" className="inline-block bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
              Order Now
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark">Featured Pizzas</h2>
          <Link to="/menu" className="text-primary font-semibold hover:underline">
            View Full Menu →
          </Link>
        </div>
        {loading ? (
          <SkeletonLoader count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pizzas.map((pizza) => (
              <PizzaCard key={pizza._id} pizza={pizza} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
