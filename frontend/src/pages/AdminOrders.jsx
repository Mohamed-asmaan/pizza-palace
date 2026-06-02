// ============================================
// AdminOrders.jsx - ADMIN ORDER TABLE (/admin/orders)
// Change status dropdown = kitchen/delivery workflow for each order
// ============================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderAPI } from '../services/api';
import { formatPrice, formatDate, ORDER_STATUSES } from '../utils/format';
import StatusBadge from '../components/StatusBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    orderAPI
      .getAllOrders()
      .then((res) => setOrders(res.data.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // PUT /api/orders/:id/status
  const handleStatusUpdate = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleCancel = async (orderId) => {
    try {
      await orderAPI.cancel(orderId);
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/admin" className="text-primary text-sm hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-neutral-dark mt-1">Manage Orders</h1>
      </div>

      {loading ? (
        <SkeletonLoader type="table" count={6} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No orders yet"
          description="Orders placed by customers will appear here for management."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold">Order</th>
                <th className="text-left p-4 font-semibold">Customer</th>
                <th className="text-left p-4 font-semibold">Items</th>
                <th className="text-left p-4 font-semibold">Total</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-gray-500 text-xs">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium">{order.customerId?.name || 'Unknown'}</p>
                    <p className="text-gray-500 text-xs">{order.customerId?.email}</p>
                  </td>
                  <td className="p-4">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-xs">
                        {item.pizza?.name} × {item.qty}
                      </p>
                    ))}
                  </td>
                  <td className="p-4 font-semibold">{formatPrice(order.totalAmount)}</td>
                  <td className="p-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="input-field text-xs py-1 mb-2"
                      aria-label={`Update status for order ${order._id}`}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {order.status === 'Pending' && (
                      <button
                        type="button"
                        onClick={() => handleCancel(order._id)}
                        className="block text-red-600 text-xs hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
