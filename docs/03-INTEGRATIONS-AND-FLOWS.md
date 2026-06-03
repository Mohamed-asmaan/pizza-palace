# Libraries, Integrations & End-to-End Flows (Complete)

This document is the **expanded version** of the integration map from our chat — every library, how it connects in *your* code, and numbered flows you can trace while demoing.

---

## Big picture diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│ BROWSER                                                                  │
│  Pages/Components ──► React Router (URL → page)                          │
│       │                                                                  │
│       ├──► useAuth / useCart (Context facades)                           │
│       │         └──► Redux Toolkit (authSlice, cartSlice)                │
│       │                   └──► localStorage (token, user, cart)          │
│       │                                                                  │
│       └──► api.js (Axios) ──► Authorization: Bearer <JWT>              │
│                 │                                                        │
│                 └──► razorpay.js ──► checkout.razorpay.com (script tag)  │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTPS JSON
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ EXPRESS :5000                                                            │
│  helmet → cors → express.json → morgan                                   │
│       → /api/auth|pizzas|orders|payments (routes)                        │
│            → express-validator → verifyToken / isAdmin / optionalAuth    │
│            → controllers                                                 │
│            → Mongoose models                                             │
│       → errorHandler (last)                                              │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ MONGODB                                                                  │
│  users │ pizzas │ orders                                                 │
└─────────────────────────────────────────────────────────────────────────┘

Payment side channel:
  paymentController ──► razorpay npm SDK ──► Razorpay API (test)
  verifyPayment ──► Node crypto HMAC ──► compare signature
```

**Rule of thumb:** UI → Axios → Express route → middleware → controller → Mongoose → MongoDB.  
Auth + cart also touch **localStorage** before/without server.

---

## Complete dependency list

### Backend (`backend/package.json`)

| Package | Version (approx) | Role in THIS app | Files |
|---------|------------------|------------------|-------|
| express | ^5.1 | HTTP server, Router, json middleware | server.js, routes/* |
| mongoose | ^8.16 | Schemas, queries, populate | models/*, controllers/* |
| dotenv | ^16.5 | Load .env | server.js line 1 |
| bcryptjs | ^3.0.2 | Hash/compare passwords | models/User.js |
| jsonwebtoken | ^9.0.2 | sign + verify JWT | authController.js, auth.js |
| express-validator | ^7.2.1 | body() rules on routes | routes/* |
| cors | ^2.8.5 | Cross-origin allowlist | server.js |
| helmet | ^8.1.0 | Security headers | server.js |
| morgan | ^1.10.0 | HTTP logs | requestLogger.js |
| razorpay | ^2.9.6 | orders.create | paymentController.js |
| nodemon | dev | Auto-restart | npm run dev |

**Node built-in:** `crypto` — HMAC in verifyPayment.

### Frontend (`frontend/package.json`)

| Package | Role | Files |
|---------|------|-------|
| react / react-dom | UI | all jsx |
| vite | dev + build | vite.config.js |
| @vitejs/plugin-react | JSX + HMR | vite.config.js |
| react-router-dom | routing | App.jsx, pages, guards |
| @reduxjs/toolkit | slices, thunk, configureStore | store/* |
| react-redux | Provider, hooks | main.jsx, contexts |
| axios | HTTP | api.js |
| react-hot-toast | notifications | main.jsx, pages |
| framer-motion | animations | Home, Menu, Cart, modals |
| tailwindcss | utilities | all className |
| postcss / autoprefixer | CSS build | postcss.config.js |

### Not in package.json

| Tech | Role |
|------|------|
| Razorpay checkout.js | CDN in razorpay.js |
| localStorage | token, user, cart |
| Intl API | format.js |
| MongoDB | external database |
| fs/path | importCatalog read JSON |

---

## Integration deep dives (with code paths)

### 1. dotenv

**When:** First line of `server.js`.  
**Why:** Without it, `mongoose.connect(process.env.MONGO_URI)` is undefined.

**Variables consumed:**

- `MONGO_URI`, `JWT_SECRET`, `PORT`, `NODE_ENV`, `CLIENT_URL`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`

---

### 2. express

**Patterns used:**

- `app.use(middleware)` — global
- `app.get('/api/health', handler)` — inline route
- `app.use('/api/auth', authRoutes)` — sub-router
- `express.json()` — `req.body` for POST/PUT
- `module.exports = app` — testability

**Not used in this project:** express.static for frontend (Vite hosts UI separately).

---

### 3. mongoose

**Connect:** `await mongoose.connect(process.env.MONGO_URI)` once at startup.

**Operations used across app:**

| Operation | Example use |
|-----------|-------------|
| `Model.create()` | register, placeOrder |
| `Model.find()` | getAllPizzas, getMyOrders |
| `Model.findById()` | getPizzaById |
| `Model.findOne()` | login, duplicate razorpay order |
| `Model.findByIdAndUpdate()` | updatePizza, updateOrderStatus |
| `Model.findByIdAndDelete()` | deletePizza, cancelOrder |
| `Model.countDocuments()` | importCatalog skip check |
| `Model.insertMany()` | seed pizzas |
| `.populate()` | attach user/pizza details to orders |

**Schema features:** required, enum, min, custom validator (items length), ref ObjectId.

---

### 4. bcryptjs

**Never imported in controllers.**

Flow:

```
Register: User.create({ password: "plain123" })
  → pre('save') → bcrypt.hash → DB stores $2a$12$...

Login: user.comparePassword("plain123")
  → bcrypt.compare → true/false
```

**select: false** on password means normal `User.findById` won't leak hash to JSON responses.

---

### 5. jsonwebtoken (JWT)

**Sign (authController):**

```js
jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '24h' })
```

**Verify (middleware/auth.js):**

```js
decoded = jwt.verify(token, JWT_SECRET)
user = await User.findById(decoded.id)
req.user = user
```

**Frontend storage:** `localStorage.setItem('token', token)` in authSlice setAuth.

**Frontend send:** Axios interceptor adds `Authorization: Bearer ${token}`.

**Expiry:** After 24h, verify fails → 401 → interceptor clears storage.

---

### 6. express-validator

Runs **on route** as array of middleware functions **before** controller.

Example chain:

```
POST /register
  → body('email').isEmail()
  → body('password').isLength({ min: 6 })
  → handleValidationErrors
  → register
```

`handleValidationErrors` reads `validationResult(req)` — if errors, return 400 JSON and **never** call controller.

---

### 7. cors

Browser sends `Origin: http://localhost:5173` on fetch from Vite.

Server checks against `allowedOrigins` array + `CLIENT_URL` split.

`credentials: true` allows cookies if you added them later (currently app uses Authorization header, not cookies).

---

### 8. helmet

Sets headers like `X-Content-Type-Options`, `X-DNS-Prefetch-Control`, etc.

One line — no config in this project.

---

### 9. morgan

Logs: `GET /api/pizzas 200 12.345 ms - 1234`

Production uses longer 'combined' format for log aggregators.

---

### 10. razorpay (server) + crypto

**Step 1 — create-order (server):**

- Validates cart items (orderItems.js)
- `amountInPaise = total * 100`
- `razorpay.orders.create(...)` returns `id` like `order_xxxx`

**Step 2 — checkout popup (client):**

- Uses `keyId`, `amount`, `order_id` from step 1
- User completes test payment

**Step 3 — verify (server):**

- Client sends `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
- Server computes HMAC with **secret** — client cannot forge signature without secret
- Creates Order in MongoDB only after match

**Test-only guard:** `keyId.startsWith('rzp_test_')` — rejects live keys.

---

### 11. Redux Toolkit + react-redux

**Why Redux for this app:**

- Auth must be global (Navbar, guards, Checkout)
- Cart must be global (Navbar badge, Cart, Checkout)
- Persist to localStorage on every cart mutation

**createAsyncThunk:** `initializeAuth` — async profile fetch with pending/fulfilled/rejected in extraReducers.

**Immer:** RTK uses Immer inside reducers — `existing.qty += qty` is safe (looks mutable, isn't).

**Provider:** `main.jsx` wraps entire tree.

---

### 12. Context (AuthProvider / CartProvider)

**Not** React Context API for state storage — children pass-through only.

**Purpose:** Single import `useAuth()` instead of:

```js
const user = useSelector(s => s.auth.user)
const dispatch = useDispatch()
// ...
```

---

### 13. axios

**Single instance** — consistent baseURL and interceptors.

**Why not fetch():** interceptors, automatic JSON, simpler error `error.response.data`.

**Grouped exports** — pages don't construct URLs manually (fewer typos).

---

### 14. react-router-dom v7

| Hook / Component | Used for |
|------------------|----------|
| BrowserRouter | HTML5 history |
| Routes / Route | declarative routing |
| Link / NavLink | navigation, active styles |
| useNavigate | programmatic redirect |
| useParams | pizza id |
| useLocation | return URL after login |
| Navigate | redirect in guards |

---

### 15. react-hot-toast

`<Toaster />` once in main.jsx.

`toast.success` / `toast.error` in Auth, Cart, Checkout, Orders, Admin pages.

Non-blocking — doesn't replace error UI for forms.

---

### 16. framer-motion

`motion.div`, `motion.form`, `AnimatePresence` for:

- Hero entrance (Home)
- Card stagger (PizzaCard, Menu)
- Cart list layout animations
- Admin modal fade/scale

No connection to data layer.

---

### 17. tailwind + index.css

Tailwind scans JSX for class strings.

Custom component classes in `@layer components` reduce repetition (`btn-primary`, `card`).

---

### 18. Vite env

`import.meta.env.PROD` — true in `npm run build` output.

`import.meta.env.VITE_API_URL` — injected at build from `.env.production`:

```
VITE_API_URL=https://pizza-palace-api-6udi.onrender.com/api
```

---

## End-to-end flows (numbered, every library labeled)

### Flow A — Register / Login (JWT chain)

| Step | Layer | What happens |
|------|-------|--------------|
| 1 | React | User submits `Auth.jsx` form |
| 2 | Axios | `authAPI.login` or `register` POST |
| 3 | express | Route matched `/api/auth/login` |
| 4 | express-validator | Validates email/password shape |
| 5 | authController | find/create User |
| 6 | bcryptjs | compare or hash password |
| 7 | jsonwebtoken | `sign` → token string |
| 8 | Axios | Response to browser |
| 9 | Redux | `setAuth` action |
| 10 | localStorage | token + user JSON saved |
| 11 | react-router | navigate to `from` or `/admin` |
| 12 | react-hot-toast | success message |

**Next API call:** step 2 Axios interceptor attaches Bearer token → step 5 `verifyToken` → `req.user`.

---

### Flow B — App load session restore

| Step | Layer | What happens |
|------|-------|--------------|
| 1 | React | App.jsx useEffect |
| 2 | Redux thunk | initializeAuth pending |
| 3 | localStorage | read token |
| 4 | Axios | GET /auth/profile + Bearer |
| 5 | verifyToken | jwt.verify + load user |
| 6 | authController | getProfile returns user |
| 7 | Redux | fulfilled → set user, loading false |
| 8 | ProtectedRoute | now allows /cart without redirect |

If token invalid: rejected → clear storage → user sees login on protected pages.

---

### Flow C — Browse menu (public)

| Step | Layer | What happens |
|------|-------|--------------|
| 1 | React | Menu.jsx mount |
| 2 | Axios | GET /pizzas?category=Veg (optional) |
| 3 | optionalAuth | no header → req.user undefined |
| 4 | pizzaController | filter isAvailable true |
| 5 | mongoose | Pizza.find |
| 6 | React | setPizzas, render PizzaCard |
| 7 | framer-motion | card animate |

Search: **no axios** — useMemo filters in browser.

---

### Flow D — Add to cart

| Step | Layer | What happens |
|------|-------|--------------|
| 1 | React | PizzaDetail Add to Cart |
| 2 | useAuth | check isAuthenticated |
| 3 | useCart | addToCart(pizza, qty) |
| 4 | Redux | cartSlice addItem |
| 5 | localStorage | pizza_palace_cart updated |
| 6 | Navbar | itemCount re-renders |

**No backend** until checkout.

---

### Flow E — COD checkout

| Step | Layer | What happens |
|------|-------|--------------|
| 1 | React | Checkout submit |
| 2 | Axios | POST /orders { items, deliveryAddress } |
| 3 | verifyToken | req.user set |
| 4 | express-validator | items array rules |
| 5 | orderController | placeOrder |
| 6 | orderItems.js | DB prices + availability |
| 7 | mongoose | Order.create cod/unpaid/Pending |
| 8 | Redux | clearAllItems |
| 9 | react-router | /orders |
| 10 | toast | success |

---

### Flow F — Razorpay checkout

| Step | Layer | What happens |
|------|-------|--------------|
| 1 | React | Checkout mount → getConfig |
| 2 | Axios | GET /payments/config |
| 3 | React | paymentEnabled true → submit uses Razorpay path |
| 4 | Axios | POST /payments/create-order |
| 5 | razorpay SDK | orders.create server-side |
| 6 | razorpay.js | load script + open modal |
| 7 | User | pays in Razorpay UI |
| 8 | Axios | POST /payments/verify + signature fields |
| 9 | crypto | HMAC verify |
| 10 | mongoose | Order.create paid/Confirmed |
| 11 | Redux + router + toast | same as COD |

Duplicate refresh on verify: step 10 finds existing by razorpayOrderId → returns same order (idempotent).

---

### Flow G — Admin update status

| Step | Layer | What happens |
|------|-------|--------------|
| 1 | React | AdminOrders select onChange |
| 2 | Axios | PUT /orders/:id/status |
| 3 | verifyToken + isAdmin | |
| 4 | orderController | VALID_STATUSES check |
| 5 | mongoose | findByIdAndUpdate |
| 6 | React | fetchOrders refresh |

---

## What is NOT in this project (avoid claiming in review)

- No Redux Persist package (manual localStorage in slices)
- No refresh tokens / token rotation
- No WebSockets for live order tracking
- No file upload (imageUrl is a string URL)
- No email/SMS notifications
- No rate limiting middleware
- No Swagger/OpenAPI docs
- Backend does not serve React build (separate deploy)

---

**Next:** [04-API-DATA-AND-REVIEW.md](./04-API-DATA-AND-REVIEW.md) — full request/response JSON examples

---

## Code — how each library appears in this project

> Added: copy-paste snippets from the repo. Nothing above was removed.

### dotenv + express + mongoose (server boot)

```js
require('dotenv').config();
await mongoose.connect(process.env.MONGO_URI);
app.use(express.json());
app.use('/api/orders', orderRoutes);
```

### bcryptjs (User model — never in controller)

```js
this.password = await bcrypt.hash(this.password, 12);
return bcrypt.compare(candidatePassword, this.password);
```

### jsonwebtoken (sign + verify)

```js
// authController — after login
jwt.sign({ id: user._id, email, role }, process.env.JWT_SECRET, { expiresIn: '24h' });

// middleware/auth.js — every protected route
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = await User.findById(decoded.id);
```

### express-validator (route layer)

```js
body('items').isArray({ min: 1 }),
body('deliveryAddress').trim().notEmpty(),
handleValidationErrors,  // → 400 with field errors
placeOrder
```

### axios + JWT (frontend)

```js
config.headers.Authorization = 'Bearer ' + localStorage.getItem('token');
```

### Redux Toolkit (auth)

```js
dispatch(setAuth({ token, user }));     // login
dispatch(initializeAuth());             // App.jsx on mount
dispatch(clearAllItems());              // after checkout
```

### Razorpay server + crypto

```js
const razorpayOrder = await razorpay.orders.create({ amount: amountInPaise, currency: 'INR' });
const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
```

### Razorpay browser (Checkout)

```js
await loadRazorpayScript();
await paymentAPI.createOrder({ items });
await openRazorpayCheckout({ keyId, amount, orderId: razorpayOrderId });
await paymentAPI.verify({ razorpay_order_id, razorpay_payment_id, razorpay_signature, items, deliveryAddress });
```

### react-router-dom (guards)

```jsx
<Navigate to="/auth" state={{ from: location }} replace />
const { id } = useParams();
```

### react-hot-toast

```js
toast.success('Order placed successfully!');
toast.error(err.response?.data?.message || 'Failed');
```

### framer-motion (UI only)

```jsx
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
```

### Tailwind + custom classes

```jsx
<button className="btn-primary">Place Order</button>
```
