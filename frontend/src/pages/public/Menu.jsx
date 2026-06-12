// ============================================
// Menu.jsx - FULL MENU PAGE
// Category buttons call API with filter; search filters results on the client
// ============================================
import { useEffect, useState, useMemo } from 'react';
import { pizzaAPI } from '@/services/api';
import { CATEGORIES } from '@/constants/catalog';
import PizzaCard from '@/components/ui/PizzaCard';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import EmptyState from '@/components/ui/EmptyState';

const Menu = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  // reload pizzas when user picks a category tab
  useEffect(() => {
    setLoading(true);
    const params = category !== 'All' ? { category } : {};
    pizzaAPI
      .getAll(params)
      .then((res) => setPizzas(res.data.data))
      .catch(() => setPizzas([]))
      .finally(() => setLoading(false));
  }, [category]);

  // search box runs locally so we don't need extra API calls while typing
  const filteredPizzas = useMemo(() => {
    if (!search.trim()) return pizzas;
    const query = search.toLowerCase();
    return pizzas.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }, [pizzas, search]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-dark mb-2">Our Menu</h1>
        <p className="text-gray-600 mb-6">Explore our full pizza catalogue</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="search"
            placeholder="Search pizzas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field flex-1"
            aria-label="Search pizzas"
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Category filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-300 text-neutral-dark hover:border-primary'
                }`}
                aria-pressed={category === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonLoader count={8} />
        ) : filteredPizzas.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No pizzas found"
            description="Try adjusting your search or category filter to find what you're looking for."
            actionLabel="View All Pizzas"
            actionLink="/menu"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPizzas.map((pizza) => (
              <PizzaCard key={pizza._id} pizza={pizza} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
