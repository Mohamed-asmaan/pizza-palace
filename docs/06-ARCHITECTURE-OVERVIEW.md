# Pizza Palace — Full App Architecture & Communication Map

> One picture: how **frontend folders**, **backend folders**, and **HTTP** connect.  
> See also [frontend/STRUCTURE.md](../frontend/STRUCTURE.md) and [backend/STRUCTURE.md](../backend/STRUCTURE.md).

---

## 1. System overview (two apps, one API)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BROWSER                                                                │
│  Vercel: https://pizza-palace-gules.vercel.app  (React SPA)             │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTPS  JSON  Authorization: Bearer JWT
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Render: https://pizza-palace-api-6udi.onrender.com/api  (Express)      │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ Mongoose
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  MongoDB Atlas — collections: users, pizzas, orders                     │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                    Razorpay (optional test checkout)
```

---

## 2. Frontend tree (what lives where)

```
frontend/src/
├── main.jsx                 → mount React, Redux, Router, providers
├── app/
│   ├── App.jsx              → Navbar + Footer + dispatch(initializeAuth)
│   └── AppRoutes.jsx        → all <Route> definitions
├── pages/
│   ├── public/              Home, Menu, PizzaDetail, Auth
│   ├── protected/           Cart, Checkout, Orders
│   └── admin/               AdminDashboard, AdminPizzas, AdminOrders
├── components/
│   ├── layout/              Navbar, Footer
│   ├── ui/                  PizzaCard, EmptyState, SkeletonLoader, StatusBadge
│   └── guards/              ProtectedRoute, AdminRoute
├── services/api.js          → axios + authAPI, pizzaAPI, orderAPI, paymentAPI
├── hooks/                   AuthProvider, CartProvider, useAuth, useCart
├── store/                   authSlice, cartSlice, store.js
├── constants/               catalog.js, orders.js
└── utils/                   format.js, razorpay.js
```

---

## 3. Backend tree (what lives where)

```
backend/
├── server.js                → Express app, CORS, mount /api/*, MongoDB, importCatalog
├── routes/                  authRoutes, pizzaRoutes, orderRoutes, paymentRoutes
├── controllers/             auth, pizza, order, payment handlers
├── middleware/              verifyToken, isAdmin, optionalAuth, handleValidationErrors, …
├── models/                  User, Pizza, Order
└── utils/                   importCatalog, validateAndBuildOrderItems
```

---

## 4. Access levels (frontend pages ↔ backend endpoints)

| Level | Frontend `pages/` | Backend middleware | Who |
|-------|-------------------|--------------------|-----|
| **Public** | `public/*` | none or `optionalAuth` | Guest |
| **Protected** | `protected/*` | `verifyToken` | Logged-in customer |
| **Admin** | `admin/*` | `verifyToken` + `isAdmin` | Admin user |

---

## 5. Master API map (frontend → backend)

Every browser call goes: **Page** → **`services/api.js`** → **Route** → **Middleware** → **Controller** → **Model** → **MongoDB**.

| Frontend caller | api.js method | HTTP | Backend route | Controller function |
|-----------------|---------------|------|---------------|-------------------|
| `App.jsx` / `authSlice` | `authAPI.getProfile` | GET | `/api/auth/profile` | `getProfile` |
| `Auth.jsx` | `authAPI.login` | POST | `/api/auth/login` | `login` |
| `Auth.jsx` | `authAPI.register` | POST | `/api/auth/register` | `register` |
| `Home.jsx`, `Menu.jsx` | `pizzaAPI.getAll` | GET | `/api/pizzas` | `getAllPizzas` |
| `PizzaDetail.jsx` | `pizzaAPI.getById` | GET | `/api/pizzas/:id` | `getPizzaById` |
| `Checkout.jsx` | `paymentAPI.getConfig` | GET | `/api/payments/config` | `getPaymentConfig` |
| `Checkout.jsx` (COD) | `orderAPI.place` | POST | `/api/orders` | `placeOrder` |
| `Checkout.jsx` (pay) | `paymentAPI.createOrder` | POST | `/api/payments/create-order` | `createPaymentOrder` |
| `Checkout.jsx` (pay) | `paymentAPI.verify` | POST | `/api/payments/verify` | `verifyPayment` |
| `Orders.jsx` | `orderAPI.getMyOrders` | GET | `/api/orders/my` | `getMyOrders` |
| `Orders.jsx` | `orderAPI.cancel` | DELETE | `/api/orders/:id` | `cancelOrder` |
| `AdminDashboard.jsx` | `orderAPI.getAllOrders` | GET | `/api/orders` | `getAllOrders` |
| `AdminOrders.jsx` | `orderAPI.updateStatus` | PUT | `/api/orders/:id/status` | `updateOrderStatus` |
| `AdminOrders.jsx` | `orderAPI.cancel` | DELETE | `/api/orders/:id` | `cancelOrder` |
| `AdminPizzas.jsx` | `pizzaAPI.getAll` | GET | `/api/pizzas` | `getAllPizzas` |
| `AdminPizzas.jsx` | `pizzaAPI.create` | POST | `/api/pizzas` | `createPizza` |
| `AdminPizzas.jsx` | `pizzaAPI.update` | PUT | `/api/pizzas/:id` | `updatePizza` |
| `AdminPizzas.jsx` | `pizzaAPI.delete` | DELETE | `/api/pizzas/:id` | `deletePizza` |

**No API (client-only):** `Cart.jsx` uses Redux + `localStorage` only until checkout.

---

## 6. Frontend boot sequence

```
index.html
  → main.jsx
       Provider(store)
         BrowserRouter
           AuthProvider / CartProvider
             App
               useEffect → initializeAuth() [authSlice]
                 → authAPI.getProfile() if token in localStorage
               Navbar (useAuth, useCart)
               AppRoutes → active page
               Footer
```

**localStorage keys:** `token`, `user`, `pizza_palace_cart`

---

## 7. Backend request pipeline

```
HTTP request
  → server.js (helmet, cors, express.json, requestLogger)
  → routes/*.js (path + middleware chain)
  → middleware/verifyToken | isAdmin | optionalAuth | handleValidationErrors
  → controllers/*.js
  → models/*.js → MongoDB
  → JSON response
  → errorHandler.js (on thrown errors)
```

**Startup:** `mongoose.connect` → `importCatalog()` (seed pizzas + admin if empty)

---

## 8. Function inventory by file

### Frontend — pages

| File | Main responsibilities | API / state |
|------|----------------------|-------------|
| `Home.jsx` | Hero, 4 featured pizzas | `pizzaAPI.getAll` |
| `Menu.jsx` | Full menu, category filter, search | `pizzaAPI.getAll` |
| `PizzaDetail.jsx` | Pizza info, qty, add to cart | `pizzaAPI.getById`, `useCart`, `useAuth` |
| `Auth.jsx` | Login / register tabs | `authAPI.login/register`, `useAuth().login` |
| `Cart.jsx` | List cart, qty, remove | `useCart` only (Redux) |
| `Checkout.jsx` | Address, COD or Razorpay | `paymentAPI`, `orderAPI`, `razorpay.js` |
| `Orders.jsx` | Order history, cancel Pending | `orderAPI.getMyOrders`, `cancel` |
| `AdminDashboard.jsx` | Stats cards | `orderAPI.getAllOrders` |
| `AdminPizzas.jsx` | CRUD pizzas, availability | `pizzaAPI.*` |
| `AdminOrders.jsx` | All orders, status dropdown | `orderAPI.getAllOrders`, `updateStatus` |

### Frontend — shared

| File | Role |
|------|------|
| `App.jsx` | Layout shell, `initializeAuth` on mount |
| `AppRoutes.jsx` | URL → page component mapping |
| `ProtectedRoute.jsx` | Redirect to `/auth` if not logged in |
| `AdminRoute.jsx` | Redirect if not admin |
| `Navbar.jsx` | Nav links, cart badge, login/logout |
| `Footer.jsx` | Static footer |
| `PizzaCard.jsx` | Pizza tile → link `/pizza/:id` |
| `api.js` | Axios instance + 4 API groups |
| `authSlice.js` | `initializeAuth`, `setAuth`, `logoutUser` |
| `cartSlice.js` | `addItem`, `updateItemQty`, `removeItem`, `clearAllItems` |
| `useAuth.js` | Read auth state, `login`, `logout` |
| `useCart.js` | Read cart, `addToCart`, `clearCart`, etc. |
| `format.js` | `formatPrice`, `formatDate` |
| `razorpay.js` | `loadRazorpayScript`, `openRazorpayCheckout` |

### Backend — controllers

| File | Exported functions |
|------|-------------------|
| `authController.js` | `register`, `login`, `getProfile`, `updateProfile` |
| `pizzaController.js` | `getAllPizzas`, `getPizzaById`, `createPizza`, `updatePizza`, `deletePizza` |
| `orderController.js` | `placeOrder`, `getMyOrders`, `getAllOrders`, `updateOrderStatus`, `cancelOrder` |
| `paymentController.js` | `getPaymentConfig`, `createPaymentOrder`, `verifyPayment` |

### Backend — middleware

| File | Purpose |
|------|---------|
| `verifyToken.js` | JWT → `req.user` |
| `isAdmin.js` | `req.user.role === 'admin'` |
| `optionalAuth.js` | JWT if header present (menu) |
| `handleValidationErrors.js` | `express-validator` → 400 JSON |
| `errorHandler.js` | Global error JSON |
| `requestLogger.js` | Morgan HTTP logs |

### Backend — utils

| File | Purpose |
|------|---------|
| `validateAndBuildOrderItems.js` | Validate line items, sum total from DB prices |
| `importCatalog.js` | Seed pizzas + create admin from env |

---

## 9. End-to-end flows

### A. Browse menu (public)

```
Home/Menu → pizzaAPI.getAll → GET /api/pizzas
  → pizzaRoutes (optionalAuth) → getAllPizzas → Pizza.find()
```

### B. Add to cart (client only until checkout)

```
PizzaDetail → useCart().addToCart → cartSlice → localStorage
Cart → useCart() read/update (no HTTP)
```

### C. Login

```
Auth → authAPI.login → POST /api/auth/login → authController.login
  → useAuth().login → authSlice setAuth → localStorage token + user
App mount → initializeAuth → authAPI.getProfile
```

### D. Checkout COD

```
Checkout → orderAPI.place → POST /api/orders (verifyToken)
  → placeOrder → validateAndBuildOrderItems → Order.create
  → clearCart → navigate /orders
```

### E. Checkout Razorpay test

```
Checkout → paymentAPI.getConfig
  → paymentAPI.createOrder → Razorpay popup (razorpay.js)
  → paymentAPI.verify → Order.create (paid)
```

### F. Admin update order

```
AdminOrders → orderAPI.updateStatus → PUT /api/orders/:id/status
  → verifyToken + isAdmin → updateOrderStatus
```

---

## 10. Data ownership

| Data | Stored where | Written by |
|------|--------------|------------|
| Session (JWT) | Browser `localStorage.token` | `authSlice` after login |
| User profile cache | `localStorage.user` + Redux `auth.user` | `authSlice` |
| Cart | `localStorage.pizza_palace_cart` + Redux `cart.items` | `cartSlice` |
| Users | MongoDB `users` | `authController`, `importCatalog` |
| Menu | MongoDB `pizzas` | `importCatalog`, `pizzaController` |
| Orders | MongoDB `orders` | `orderController`, `paymentController` |

---

## 11. Guards: frontend vs backend

| Check | Frontend | Backend |
|-------|----------|---------|
| Login required | `ProtectedRoute` → `/auth` | `verifyToken` → 401 |
| Admin required | `AdminRoute` → `/` | `isAdmin` → 403 |
| Valid cart prices | — | `validateAndBuildOrderItems` (DB prices) |

Both layers enforce rules; backend is authoritative.
