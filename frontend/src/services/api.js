// ============================================
// api.js - ALL FRONTEND API CALLS GO HERE
// axios talks to backend (Render or localhost)
// ============================================

import axios from 'axios';

// backend url - local when developing, render when live
var backendUrl = 'http://localhost:5000/api';
if (import.meta.env.PROD) {
  backendUrl = 'https://pizza-palace-api-6udi.onrender.com/api';
}
if (import.meta.env.VITE_API_URL) {
  backendUrl = import.meta.env.VITE_API_URL;
}

const api = axios.create({
  baseURL: backendUrl,
  headers: { 'Content-Type': 'application/json' },
});

// attach login token to every request if user is logged in
api.interceptors.request.use(function (config) {
  var token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// if token expired, clear login from browser
api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;

// ----- AUTH (login register) -----
export const authAPI = {
  register: function (data) {
    return api.post('/auth/register', data);
  },
  login: function (data) {
    return api.post('/auth/login', data);
  },
  getProfile: function () {
    return api.get('/auth/profile');
  },
  updateProfile: function (data) {
    return api.put('/auth/profile', data);
  },
};

// ----- PIZZAS (menu) -----
export const pizzaAPI = {
  getAll: function (params) {
    return api.get('/pizzas', { params: params });
  },
  getById: function (id) {
    return api.get('/pizzas/' + id);
  },
  create: function (data) {
    return api.post('/pizzas', data);
  },
  update: function (id, data) {
    return api.put('/pizzas/' + id, data);
  },
  delete: function (id) {
    return api.delete('/pizzas/' + id);
  },
};

// ----- ORDERS -----
export const orderAPI = {
  place: function (data) {
    return api.post('/orders', data);
  },
  getMyOrders: function () {
    return api.get('/orders/my');
  },
  getAllOrders: function () {
    return api.get('/orders');
  },
  updateStatus: function (id, status) {
    return api.put('/orders/' + id + '/status', { status: status });
  },
  cancel: function (id) {
    return api.delete('/orders/' + id);
  },
};

// ----- RAZORPAY PAYMENT (test mode) -----
export const paymentAPI = {
  getConfig: function () {
    return api.get('/payments/config');
  },
  createOrder: function (data) {
    return api.post('/payments/create-order', data);
  },
  verify: function (data) {
    return api.post('/payments/verify', data);
  },
};
