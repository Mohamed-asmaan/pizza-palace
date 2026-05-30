export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
];

export const CATEGORIES = ['All', 'Veg', 'Non-Veg', 'Specialty'];

export const getStatusColor = (status) => {
  const colors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-blue-100 text-blue-800',
    Preparing: 'bg-purple-100 text-purple-800',
    'Out for Delivery': 'bg-orange-100 text-orange-800',
    Delivered: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
