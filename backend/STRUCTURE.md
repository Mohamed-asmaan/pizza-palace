# Backend folder structure

Node.js + Express REST API. Files are grouped by **layer** (routes → controllers → models).  
**Access level** (public / protected / admin) mirrors the frontend `pages/` folders — same rules, applied per endpoint.

```
backend/
├── server.js                    # entry: Express app, CORS, mount routes, MongoDB, seed catalog
│
├── routes/                      # URL tables → middleware → controller
│   ├── authRoutes.js            # /api/auth
│   ├── pizzaRoutes.js           # /api/pizzas
│   ├── orderRoutes.js           # /api/orders
│   └── paymentRoutes.js         # /api/payments
│
├── controllers/                 # business logic (DB reads/writes)
│   ├── authController.js
│   ├── pizzaController.js
│   ├── orderController.js
│   └── paymentController.js
│
├── middleware/                  # shared (like frontend components/)
│   ├── verifyToken.js           # JWT required
│   ├── isAdmin.js               # role === admin (after verifyToken)
│   ├── optionalAuth.js          # JWT if sent (menu browse)
│   ├── handleValidationErrors.js
│   ├── errorHandler.js
│   └── requestLogger.js
│
├── models/                      # Mongoose schemas (MongoDB)
│   ├── User.js
│   ├── Pizza.js
│   └── Order.js
│
├── utils/                       # helpers (no HTTP)
│   ├── importCatalog.js         # seed pizzas + admin on startup
│   └── validateAndBuildOrderItems.js
│
├── .env.example
└── package.json
```

---

## API by access level (↔ frontend pages)

### Public — no login (like `pages/public/`)

| Method | Path | Route file | Controller |
|--------|------|------------|------------|
| GET | `/api/health` | `server.js` | inline |
| POST | `/api/auth/register` | `authRoutes.js` | `register` |
| POST | `/api/auth/login` | `authRoutes.js` | `login` |
| GET | `/api/pizzas` | `pizzaRoutes.js` | `getAllPizzas` (+ `optionalAuth`) |
| GET | `/api/pizzas/:id` | `pizzaRoutes.js` | `getPizzaById` (+ `optionalAuth`) |
| GET | `/api/payments/config` | `paymentRoutes.js` | `getPaymentConfig` |

### Protected — customer JWT (like `pages/protected/`)

Uses `verifyToken` from `middleware/verifyToken.js`.

| Method | Path | Route file | Controller |
|--------|------|------------|------------|
| GET | `/api/auth/profile` | `authRoutes.js` | `getProfile` |
| PUT | `/api/auth/profile` | `authRoutes.js` | `updateProfile` |
| POST | `/api/orders` | `orderRoutes.js` | `placeOrder` (COD) |
| GET | `/api/orders/my` | `orderRoutes.js` | `getMyOrders` |
| DELETE | `/api/orders/:id` | `orderRoutes.js` | `cancelOrder` (own, Pending only) |
| POST | `/api/payments/create-order` | `paymentRoutes.js` | `createPaymentOrder` |
| POST | `/api/payments/verify` | `paymentRoutes.js` | `verifyPayment` |

### Admin — JWT + admin role (like `pages/admin/`)

Uses `verifyToken` + `isAdmin` from `middleware/isAdmin.js`.

| Method | Path | Route file | Controller |
|--------|------|------------|------------|
| POST | `/api/pizzas` | `pizzaRoutes.js` | `createPizza` |
| PUT | `/api/pizzas/:id` | `pizzaRoutes.js` | `updatePizza` |
| DELETE | `/api/pizzas/:id` | `pizzaRoutes.js` | `deletePizza` |
| GET | `/api/orders` | `orderRoutes.js` | `getAllOrders` |
| PUT | `/api/orders/:id/status` | `orderRoutes.js` | `updateOrderStatus` |

---

## Layer flow (one request)

```
HTTP request
    → server.js (CORS, JSON body, requestLogger)
    → routes/*.js (path + middleware chain)
    → middleware/ (verifyToken, isAdmin, handleValidationErrors, …)
    → controllers/*.js (logic)
    → models/*.js (MongoDB)
    → JSON response
    → errorHandler.js (on failure)
```

---

## File ↔ export naming

Each module uses the same name for file, `require`, and export:

```js
const authRoutes = require('./routes/authRoutes');
const verifyToken = require('../middleware/verifyToken');
const validateAndBuildOrderItems = require('../utils/validateAndBuildOrderItems');
```

---

## Controllers (what each file does)

| File | Handles |
|------|---------|
| `authController.js` | Register, login, profile read/update, JWT |
| `pizzaController.js` | Menu list/detail; admin CRUD |
| `orderController.js` | Place order, my orders, all orders, status, cancel |
| `paymentController.js` | Razorpay config, create order, verify signature |

---

## Models (database)

| File | Collection | Used by |
|------|------------|---------|
| `User.js` | users | auth, orders (`customerId`) |
| `Pizza.js` | pizzas | menu, order line items |
| `Order.js` | orders | checkout, admin, customer history |

---

## Utils

| File | Purpose |
|------|---------|
| `importCatalog.js` | On startup: seed default pizzas if DB empty; create admin from env |
| `validateAndBuildOrderItems.js` | Load pizzas from DB, check availability, compute `totalAmount` |

---

## Adding a new endpoint

1. Add handler in the right `controllers/*.js`.
2. Wire method + path in the matching `routes/*.js`.
3. Apply `verifyToken`, `isAdmin`, or `optionalAuth` as needed.
4. Add validators + `handleValidationErrors` when using `express-validator`.

---

## Run

```bash
cd backend && npm install && npm run dev
```

Health: http://localhost:5000/api/health  
Copy `.env.example` → `.env` (`MONGO_URI`, `JWT_SECRET`; optional Razorpay test keys, `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
