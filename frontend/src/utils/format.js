export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

// turn "BBQ Chicken Supreme" into "bbq-chicken-supreme" for nice URLs
export const makeSlug = (name) => name.toLowerCase().split(' ').join('-');

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
