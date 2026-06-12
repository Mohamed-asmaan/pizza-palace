// ============================================
// Orders.jsx - MY ORDERS (logged-in customer)
// Lists past orders; "Cancel" only works while status is still Pending
// ============================================

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderAPI } from '@/services/api';
import { formatPrice, formatDate } from '@/utils/format';
import StatusBadge from '@/components/ui/StatusBadge';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import EmptyState from '@/components/ui/EmptyState';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getMyOrders();
      setOrders(res.data.data);
    } catch {
      toast.error('Failed to load orders');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // DELETE /api/orders/:id — backend checks status and ownership
  const handleCancel = async (orderId) => {
    try {
      await orderAPI.cancel(orderId);
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      let message = 'Failed to cancel order';
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      }
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon="📦"
          title="No orders yet"
          description="Once you place an order, it will appear here with real-time status tracking."
          actionLabel="Order Now"
          actionLink="/menu"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-neutral-dark mb-8">Order History</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="card p-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Order #{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.pizza?.name || 'Pizza'} × {item.qty}
                  </span>
                  <span>{formatPrice((item.pizza?.price || 0) * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Delivery: {order.deliveryAddress}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Payment:{' '}
                  {order.paymentStatus === 'paid'
                    ? 'Paid via Razorpay'
                    : order.paymentMethod === 'cod'
                      ? 'Cash on delivery'
                      : 'Unpaid'}
                </p>
                <p className="font-bold text-primary mt-1">{formatPrice(order.totalAmount)}</p>
              </div>
              {order.status === 'Pending' && (
                <button
                  type="button"
                  onClick={() => handleCancel(order._id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
