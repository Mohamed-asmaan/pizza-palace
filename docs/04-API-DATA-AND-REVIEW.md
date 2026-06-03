# API Reference, Data Shapes, Errors & Review Pack

Complete request/response examples, status codes, localStorage contract, deployment, 2-hour plan, Q&A, and verbal script.

---

## Standard response envelope

Most endpoints return:

```json
{
  "success": true,
  "data": { ... },
  "count": 8
}
```

Errors:

```json
{
  "success": false,
  "message": "Human readable message",
  "statusCode": 400,
  "errors": [{ "field": "email", "message": "Valid email is required" }]
}
```

`errors` array only on validation failures.

---

## Auth API

Base: `/api/auth`

### POST /register

**Auth:** None

**Body:**

```json
{
  "name": "Asmaan Khan",
  "email": "user@example.com",
  "password": "secret12"
}
```

**Success 201:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "674e1a2b3c4d5e6f7a8b9c0d",
      "name": "Asmaan Khan",
      "email": "user@example.com",
      "role": "customer"
    }
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 400 | Email already registered |
| 400 | Validation failed (name/email/password rules) |

---

### POST /login

**Body:**

```json
{
  "email": "user@example.com",
  "password": "secret12"
}
```

**Success 200:** same shape as register.

**Errors:**

| Status | Message |
|--------|---------|
| 401 | Invalid email or password |
| 400 | Validation failed |

---

### GET /profile

**Headers:** `Authorization: Bearer <token>`

**Success 200:**

```json
{
  "success": true,
  "data": {
    "id": "674e...",
    "name": "Asmaan Khan",
    "email": "user@example.com",
    "role": "customer",
    "createdAt": "2026-06-01T10:00:00.000Z"
  }
}
```

**Errors:** 401 no token / invalid / user not found

---

### PUT /profile

**Headers:** Bearer token

**Body (all optional):**

```json
{
  "name": "New Name",
  "email": "new@example.com",
  "password": "newpass123"
}
```

**Success 200:** updated user in `data`.

---

## Pizzas API

Base: `/api/pizzas`

### GET /

**Query:** `?category=Veg` (optional)

**Headers:** Bearer optional (admin sees unavailable)

**Success 200:**

```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "674f...",
      "name": "Margherita Classic",
      "description": "Fresh tomato sauce...",
      "price": 299,
      "category": "Veg",
      "imageUrl": "https://images.unsplash.com/...",
      "isAvailable": true,
      "__v": 0
    }
  ]
}
```

---

### GET /:id

**Success 200:** `{ success, data: { single pizza } }`

**404:** Pizza not found (or unavailable for non-admin)

---

### POST / (admin)

**Headers:** Bearer admin token

**Body:**

```json
{
  "name": "New Pizza",
  "description": "Description here",
  "price": 350,
  "category": "Veg",
  "imageUrl": "https://example.com/img.jpg",
  "isAvailable": true
}
```

**Success 201:** created pizza in `data`.

---

### PUT /:id (admin)

Partial updates allowed via validator (all fields optional).

---

### DELETE /:id (admin)

**Success 200:**

```json
{
  "success": true,
  "message": "Pizza deleted successfully"
}
```

---

## Orders API

Base: `/api/orders`

### POST / (COD — logged in)

**Body:**

```json
{
  "items": [
    { "pizza": "674f11111111111111111111", "qty": 2 },
    { "pizza": "674f22222222222222222222", "qty": 1 }
  ],
  "deliveryAddress": "42 Baker Street, Mumbai 400001"
}
```

**Success 201:**

```json
{
  "success": true,
  "data": {
    "_id": "675a...",
    "customerId": { "_id": "674e...", "name": "User", "email": "user@example.com" },
    "items": [
      {
        "pizza": {
          "_id": "674f...",
          "name": "Margherita Classic",
          "price": 299
        },
        "qty": 2
      }
    ],
    "totalAmount": 897,
    "status": "Pending",
    "paymentStatus": "unpaid",
    "paymentMethod": "cod",
    "deliveryAddress": "42 Baker Street...",
    "createdAt": "..."
  }
}
```

**Errors:**

| Status | Cause |
|--------|-------|
| 400 | Pizza not available / empty items / validation |
| 401 | No token |

---

### GET /my

**Success 200:** `{ success, count, data: [ orders... ] }` sorted newest first.

---

### GET / (admin)

All orders, populated.

---

### PUT /:id/status (admin)

**Body:**

```json
{
  "status": "Preparing"
}
```

**Valid values:** Pending, Confirmed, Preparing, Out for Delivery, Delivered

**400:** Invalid order status

---

### DELETE /:id

**Success 200:** `{ success, message: "Order cancelled successfully" }`

**403:** Not owner and not admin

**400:** Only pending orders can be cancelled

---

## Payments API

Base: `/api/payments`

### GET /config

**Auth:** None

**Success 200 (configured):**

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "testMode": true,
    "keyId": "rzp_test_xxxx",
    "currency": "INR"
  }
}
```

**When keys missing:** `enabled: false`, `keyId: null`

---

### POST /create-order

**Auth:** Bearer required

**Body:**

```json
{
  "items": [
    { "pizza": "674f...", "qty": 1 }
  ]
}
```

**Success 200:**

```json
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_xxxxxxxx",
    "amount": 29900,
    "currency": "INR",
    "keyId": "rzp_test_xxxx",
    "totalAmount": 299
  }
}
```

Note: `amount` is in **paise** (29900 = ₹299).

**Errors:** 503 gateway not configured, 400 min amount, 400 unavailable pizza

---

### POST /verify

**Auth:** Bearer required

**Body:**

```json
{
  "items": [{ "pizza": "674f...", "qty": 1 }],
  "deliveryAddress": "42 Baker Street",
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_yyy",
  "razorpay_signature": "abc123..."
}
```

**Success 201:** Order object (paid, Confirmed) in `data`.

**Success 200:** If order already exists for that razorpay order id (duplicate submit).

**400:** Payment verification failed (bad signature)

---

## Health

### GET /api/health

```json
{
  "success": true,
  "message": "Pizza Palace API is running"
}
```

---

## Environment variables

### Backend `.env`

See `backend/.env.example` — never commit real `.env`.

### Frontend

- `.env.example`: `VITE_API_URL=http://localhost:5000/api`
- `.env.production`: points to Render API for Vercel builds

---

## Deployment

### Frontend (Vercel) — `vercel.json`

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

SPA rewrite: all paths serve `index.html` so React Router works on refresh.

**Live URL (in code):** `https://pizza-palace-gules.vercel.app`

### Backend (Render)

**API URL (in code):** `https://pizza-palace-api-6udi.onrender.com/api`

### CORS

Backend must list Vercel URL in `allowedOrigins` or `CLIENT_URL`.

---

## localStorage contract

| Key | Type | Set by | Read by |
|-----|------|--------|---------|
| `token` | string JWT | authSlice setAuth | api interceptor, initializeAuth |
| `user` | JSON string | authSlice | authSlice initial state |
| `pizza_palace_cart` | JSON array | cartSlice | cartSlice initial state |

**Clear on:** logout, 401 response, initializeAuth rejected

---

## Order status lifecycle

```
Pending (COD default)
  → Confirmed (Razorpay default OR admin)
  → Preparing
  → Out for Delivery
  → Delivered

Cancel: only from Pending → DELETE order
```

---

## Payment state matrix

| Method | paymentStatus | status on create | When paid |
|--------|---------------|------------------|-----------|
| cod | unpaid | Pending | (manual / not in app) |
| razorpay | paid | Confirmed | after verify |

---

## 2-hour review prep (detailed)

### Hour 1 — Understand

| Min | Task |
|-----|------|
| 0–15 | Read [INDEX](../docs/INDEX.md) + [03 integrations](./03-INTEGRATIONS-AND-FLOWS.md) Flow A–G |
| 15–35 | [01 backend](./01-BACKEND-FILE-BY-FILE.md) — focus auth, orderItems, paymentController |
| 35–55 | [02 frontend](./02-FRONTEND-FILE-BY-FILE.md) — focus api.js, slices, Checkout, guards |
| 55–60 | This file — skim JSON examples |

### Hour 2 — Practice

| Min | Task |
|-----|------|
| 0–20 | Run app locally; demo customer path + admin path |
| 20–35 | Practice explaining Flow E and F without looking |
| 35–50 | Q&A below out loud |
| 50–60 | Verbal script once end-to-end |

### Demo script

1. Open `/menu` — explain public API, isAvailable filter
2. Open pizza — add to cart (login if needed)
3. `/cart` → `/checkout` — COD or Razorpay
4. `/orders` — show status; try cancel if Pending
5. Login admin — `/admin` stats → `/admin/orders` change status → `/admin/pizzas` toggle availability

---

## Review Q&A (expanded)

**Q: Why MERN?**  
A: MongoDB fits flexible menu/order documents; Express is a minimal API layer; React gives interactive cart/checkout; Node keeps one language across stack.

**Q: Why JWT instead of sessions?**  
A: Stateless API — server doesn't store session table; token carries identity; scales for SPA + separate frontend host.

**Q: Where is authorization enforced?**  
A: Backend is source of truth (`verifyToken`, `isAdmin`). Frontend guards are UX only — anyone can call API with curl if they have a token.

**Q: Why recalculate total on server?**  
A: Client could change prices in DevTools; `orderItems.js` loads authoritative price from DB.

**Q: Why two steps for Razorpay (create-order + verify)?**  
A: Create-order reserves amount with Razorpay; verify proves payment actually happened via signature before we create our Order record.

**Q: What if user closes Razorpay popup?**  
A: `openRazorpayCheckout` rejects with "Payment cancelled"; no order in our DB; cart remains.

**Q: optionalAuth purpose?**  
A: Same GET /pizzas endpoint serves public and admin; admin token adds ability to see hidden pizzas without separate admin list endpoint.

**Q: Redux vs Context?**  
A: Redux stores data; Context provides ergonomic hooks — avoids prop drilling without duplicating state.

**Q: How is admin created?**  
A: Env vars on first seed via importCatalog, not through public register (register forces customer role).

---

## 5-minute verbal script (full)

**0:00–0:30 — Intro**  
"I built Pizza Palace, a full-stack pizza delivery e-commerce site. Customers browse a menu, manage a cart, and checkout with cash on delivery or Razorpay test payments. Admins manage the catalog and order pipeline from a separate dashboard."

**0:30–1:15 — Architecture**  
"The frontend is React with Vite, React Router for pages, and Redux Toolkit for authentication and cart state persisted in localStorage. All API communication goes through a centralized Axios module that attaches JWT Bearer tokens. The backend is Express with Mongoose on MongoDB, organized into route modules for auth, pizzas, orders, and payments. Controllers contain business logic; middleware handles JWT verification and admin checks."

**1:15–2:15 — Auth**  
"On registration, passwords are hashed with bcrypt in a Mongoose pre-save hook — never stored plain text. Login returns a JWT signed with a server secret, valid for 24 hours. The client stores the token and sends it on protected routes. On app load, an async Redux thunk calls the profile endpoint to validate the session. If the token is invalid, storage is cleared and route guards send the user to login."

**2:15–3:30 — Orders & payments**  
"The cart is entirely client-side until checkout. Checkout sends only pizza IDs and quantities. The server function validateAndBuildOrderItems loads each pizza from MongoDB, checks availability, and sums prices — so totals can't be tampered with. For COD, we create a pending unpaid order immediately. For Razorpay, we first create a payment order on the server, open the Razorpay checkout modal in the browser, then verify the payment signature with HMAC SHA256 before creating a paid order. We also deduplicate by Razorpay order ID if the user refreshes after payment."

**3:30–4:15 — Admin**  
"Admins have role admin in the database. Backend routes use verifyToken plus isAdmin; the frontend uses an AdminRoute wrapper. Admins can CRUD pizzas, toggle isAvailable to hide items from customers, view all orders, and advance status from Pending through Delivered. Dashboard revenue only counts delivered orders."

**4:15–5:00 — Close**  
"Security highlights include server-side pricing, JWT authorization, role-based access, Razorpay signature verification, CORS allowlisting, and helmet headers. Future improvements I'd add are automated tests, httpOnly cookies for tokens, and pagination on order lists."

---

## Honest limitations (say these confidently)

- No automated tests in repo
- JWT in localStorage (XSS consideration)
- N+1 DB queries in orderItems loop
- No real-time order updates (customer refreshes Orders page)
- Images are external URLs, not uploaded files
- No refresh token rotation

---

## Code — what builds each API response

> Added: controller code that produces the JSON documented above. Nothing above was removed.

### POST /auth/register → 201

```js
const user = await User.create({ name, email, password, role: 'customer' });
const token = generateToken(user);
res.status(201).json({
  success: true,
  data: { token, user: { id: user._id, name, email, role: user.role } },
});
```

### GET /auth/profile (needs Bearer header)

```js
// middleware already set req.user
res.status(200).json({
  success: true,
  data: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
});
```

### GET /pizzas → `{ success, count, data: [...] }`

```js
res.status(200).json({ success: true, count: pizzas.length, data: pizzas });
```

### POST /orders (COD body → order doc)

```js
// req.body = { items: [{ pizza, qty }], deliveryAddress }
const { orderItems, totalAmount } = await validateAndBuildOrderItems(items);
const order = await Order.create({
  customerId: req.user._id, items: orderItems, totalAmount,
  deliveryAddress, status: 'Pending', paymentStatus: 'unpaid', paymentMethod: 'cod',
});
res.status(201).json({ success: true, data: populatedOrder });
```

### POST /payments/create-order → Razorpay ids (not our Order yet)

```js
res.status(200).json({
  success: true,
  data: {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,  // paise
    keyId: process.env.RAZORPAY_KEY_ID,
    totalAmount,
  },
});
```

### POST /payments/verify → paid Order

```js
if (expectedSignature !== razorpay_signature) return res.status(400).json({ success: false, message: 'Payment verification failed' });
const order = await Order.create({ ..., paymentStatus: 'paid', status: 'Confirmed' });
res.status(201).json({ success: true, data: populatedOrder });
```

### Validation error shape (express-validator)

```js
return res.status(400).json({
  success: false,
  message: 'Validation failed',
  statusCode: 400,
  errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
});
```

### Frontend: reading API response in React

```jsx
const res = await pizzaAPI.getAll();
setPizzas(res.data.data);           // pizzas array
const { token, user } = res.data.data;  // auth login response
toast.error(err.response?.data?.message);  // API error message
```
