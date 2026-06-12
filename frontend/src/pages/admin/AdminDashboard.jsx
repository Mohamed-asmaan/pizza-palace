// ============================================
// AdminDashboard.jsx - ADMIN HOME (/admin)
// Loads all orders and shows summary cards + links to manage pizzas/orders
// ============================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '@/services/api';
import { formatPrice } from '@/utils/format';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await orderAPI.getAllOrders();
        setOrders(res.data.data);
      } catch {
        setOrders([]);
      }
      setLoading(false);
    };

    loadOrders();
  }, []);

  // go through orders once and count what we need for the stat cards
  let totalRevenue = 0;
  let pendingOrders = 0;
  let activeOrders = 0;
  for (const order of orders) {
    if (order.status === 'Delivered') {
      totalRevenue = totalRevenue + order.totalAmount; // only delivered orders count as revenue
    } else if (order.status === 'Pending') {
      pendingOrders = pendingOrders + 1;
    } else {
      activeOrders = activeOrders + 1; // Confirmed / Preparing / Out for Delivery
    }
  }

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: '📦', color: 'bg-blue-50 text-blue-700' },
    { label: 'Pending', value: pendingOrders, icon: '⏳', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Active', value: activeOrders, icon: '🔥', color: 'bg-orange-50 text-orange-700' },
    { label: 'Revenue', value: formatPrice(totalRevenue), icon: '💰', color: 'bg-green-50 text-green-700' },
  ];

  const quickActions = [
    { label: 'Manage Pizzas', path: '/admin/pizzas', desc: 'Add, edit, or remove pizzas from catalogue' },
    { label: 'Manage Orders', path: '/admin/orders', desc: 'View and update order statuses' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-dark mb-8">Admin Dashboard</h1>

      {loading ? (
        <SkeletonLoader count={4} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat) => (
              <div key={stat.label} className={`card p-6 ${stat.color}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-hidden="true">
                    {stat.icon}
                  </span>
                  <div>
                    <p className="text-sm opacity-80">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="card p-6 hover:shadow-lg transition-shadow border-l-4 border-primary"
              >
                <h3 className="font-bold text-lg text-neutral-dark mb-1">{action.label}</h3>
                <p className="text-gray-600 text-sm">{action.desc}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
