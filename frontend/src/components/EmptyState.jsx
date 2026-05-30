import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const EmptyState = ({ icon, title, description, actionLabel, actionLink }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4 text-center"
  >
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
  </motion.div>
);

export default EmptyState;
