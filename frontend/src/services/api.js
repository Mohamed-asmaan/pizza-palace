import axios from 'axios';

const PRODUCTION_API_URL = 'https://pizza-palace-api-6udi.onrender.com/api';
const LOCAL_API_URL = 'http://localhost:5000/api';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const pizzaAPI = {
  getAll: (params) => api.get('/pizzas', { params }),
  getById: (id) => api.get(`/pizzas/${id}`),
  create: (data) => api.post('/pizzas', data),
  update: (id, data) => api.put(`/pizzas/${id}`, data),
  delete: (id) => api.delete(`/pizzas/${id}`),
};

export const orderAPI = {
  place: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getAllOrders: () => api.get('/orders'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancel: (id) => api.delete(`/orders/${id}`),
};

export const paymentAPI = {
  getConfig: () => api.get('/payments/config'),
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
};
