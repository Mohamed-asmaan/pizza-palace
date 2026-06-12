// EmptyState.jsx - friendly message when list is empty (cart, menu, orders)

import { Link } from 'react-router-dom';

const EmptyState = ({ icon, title, description, actionLabel, actionLink }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="text-6xl mb-4" role="img" aria-hidden="true">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-neutral-dark mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-md">{description}</p>
    {actionLabel && actionLink && (
      <Link to={actionLink} className="btn-primary">
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;
