// StatusBadge.jsx - colored pill showing order status (Pending, Delivered, etc.)

import { getStatusColor } from '@/constants/orders';

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(status)}`}
    aria-label={`Order status: ${status}`}
  >
    {status}
  </span>
);

export default StatusBadge;
