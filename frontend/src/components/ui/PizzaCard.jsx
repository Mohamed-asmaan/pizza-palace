// ============================================
// PizzaCard.jsx - ONE PIZZA TILE (Home + Menu)
// Clicking the card goes to PizzaDetail page for that id
// ============================================

import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/format';

const PizzaCard = ({ pizza }) => (
  <div className="card hover:shadow-lg transition-shadow">
    <Link to={`/pizza/${pizza._id}`} aria-label={`View ${pizza.name} details`}>
      <img
        src={pizza.imageUrl}
        alt={pizza.name}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-neutral-dark">{pizza.name}</h3>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{pizza.category}</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{pizza.description}</p>
        <p className="text-primary font-bold text-lg">{formatPrice(pizza.price)}</p>
      </div>
    </Link>
  </div>
);

export default PizzaCard;
