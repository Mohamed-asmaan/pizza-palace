# Backend — Every File Explained (Complete)

Backend root: `backend/`  
Entry: `server.js`  
Pattern: **Route → Middleware chain → Controller → Mongoose Model → MongoDB**

---

## server.js

**Role:** Bootstraps Express, connects MongoDB, seeds catalog, mounts all API routes, registers global error handler.

### Load order (critical for interviews)

1. `dotenv.config()` — must be first so `process.env` exists.
2. Create `express()` app.
3. Build `allowedOrigins` array (hardcoded localhost + Vercel + split `CLIENT_URL`).
4. `helmet()` — security headers on every response.
5. `cors({ origin, credentials })` — browser may call API from frontend origin only.
6. `express.json()` — parses `Content-Type: application/json` body into `req.body`.
7. `requestLogger()` — morgan logs each request.
8. `GET /api/health` — no auth; returns `{ success: true, message: '...' }`.
9. Mount routers:
   - `/api/auth` → `authRoutes`
   - `/api/pizzas` → `pizzaRoutes`
   - `/api/orders` → `orderRoutes`
   - `/api/payments` → `paymentRoutes`
10. `errorHandler` — **must be last** (4-arg middleware).
11. `startServer()` async:
    - `mongoose.connect(MONGO_URI)`
    - `importCatalog()` — seed if empty
    - `app.listen(PORT)`

### Export for testing

`module.exports = app` — allows requiring app without listening (tests).

`if (require.main === module)` — only auto-starts when you run `node server.js` directly.

### CORS detail

```js
origin: function (origin, callback) {
  if (!origin || allowedOrigins.indexOf(origin) !== -1) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}
```

- `!origin` → allows Postman/curl (no Origin header).
- Otherwise origin must be in allowlist or request fails.

---

## models/User.js

**Collection:** `users` (Mongoose pluralizes `User`).

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | required, trimmed |
| `email` | String | required, unique, lowercase, trimmed |
| `password` | String | required, min 6, **`select: false`** — excluded from queries by default |
| `role` | String | enum `customer` \| `admin`, default `customer` |
| `createdAt` | Date | default `Date.now` |

### bcrypt integration (pre-save hook)

```js
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
```

- Runs on `User.create()` and `user.save()` when password changed.
- **12 rounds** = cost factor (higher = slower, more secure).
- `isModified('password')` prevents re-hashing on profile update when password unchanged.

### comparePassword instance method

```js
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

Login does: `User.findOne({ email }).select('+password')` — the `+` **includes** hidden password field for this query only.

### Who can be admin?

- Register always sets `role: 'customer'` in `authController.register`.
- Admin created via `importCatalog.ensureAdminUser()` from env OR manual DB update.

---

## models/Pizza.js

**Collection:** `pizzas`

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | required |
| `description` | String | required |
| `price` | Number | required, min 0 |
| `category` | String | required — app uses `Veg`, `Non-Veg`, `Specialty` |
| `imageUrl` | String | required — external URL (Unsplash in seed) |
| `isAvailable` | Boolean | default `true` — `false` hides from customers |

No timestamps on schema — only fields above.

---

## models/Order.js

**Collection:** `orders`

### Embedded `orderItemSchema` (no `_id` on subdocs)

```js
{ pizza: ObjectId ref Pizza, qty: Number min 1 }
```

### Main order fields

| Field | Type | Notes |
|-------|------|-------|
| `customerId` | ObjectId ref User | who placed order |
| `items` | Array | min 1 item (validator) |
| `totalAmount` | Number | set by server from DB prices |
| `status` | enum | Pending, Confirmed, Preparing, Out for Delivery, Delivered |
| `paymentStatus` | enum | unpaid, paid, failed |
| `paymentMethod` | enum | razorpay, cod |
| `razorpayOrderId` | String | optional |
| `razorpayPaymentId` | String | optional |
| `deliveryAddress` | String | required |
| `createdAt` | Date | default now |

### Typical document after COD place

```json
{
  "customerId": "665a...",
  "items": [{ "pizza": "665b...", "qty": 2 }],
  "totalAmount": 598,
  "status": "Pending",
  "paymentStatus": "unpaid",
  "paymentMethod": "cod",
  "deliveryAddress": "123 Main St"
}
```

### Typical document after Razorpay verify

```json
{
  "status": "Confirmed",
  "paymentStatus": "paid",
  "paymentMethod": "razorpay",
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_yyy"
}
```

---

## middleware/auth.js

### verifyToken — step by step

1. Read `req.headers.authorization`.
2. Must start with `Bearer ` — else **401** `"Access denied. No token provided."`
3. `token = authHeader.split(' ')[1]`
4. `jwt.verify(token, JWT_SECRET)` — catch → **401** `"Invalid or expired token."`
5. `User.findById(decoded.id).select('-password')` — not found → **401** `"User not found."`
6. `req.user = user` — controllers use `req.user._id`, `req.user.role`
7. `next()`

**Important:** Token payload has `id`, not `_id`. Sign uses `user._id` as `id` in JWT.

### isAdmin

- Runs **after** `verifyToken` (needs `req.user`).
- `req.user.role !== 'admin'` → **403** `"Access denied. Admin privileges required."`

---

## middleware/errorHandler.js

Central error formatter. Controllers use `next(error)` for unexpected errors.

| Error type | HTTP | Response shape |
|------------|------|----------------|
| `err.statusCode` set | that code | `{ success: false, message, statusCode }` |
| Mongoose `ValidationError` | 400 | + `errors: [{ field, message }]` |
| Mongo duplicate `code 11000` | 400 | duplicate field message |
| Mongoose `CastError` (bad ObjectId) | 404 | Resource not found |

Controllers also return errors directly (e.g. `placeOrder` catches `error.statusCode` from `orderItems.js`).

---

## middleware/requestLogger.js

Wraps **morgan**:

- `NODE_ENV === 'production'` → `'combined'` format (Apache combined log).
- else → `'dev'` (colored, concise).

---

## utils/orderItems.js

**Function:** `validateAndBuildOrderItems(items)`

**Input:** `[{ pizza: "<mongoId>", qty: number }, ...]`

**For each item:**

1. `Pizza.findById(item.pizza)`
2. If missing OR `!isAvailable` → throw Error with `statusCode: 400`
3. Push `{ pizza: pizza._id, qty: item.qty }` to `orderItems`
4. `totalAmount += pizza.price * item.qty`

**Output:** `{ orderItems, totalAmount }`

**Why it matters:** Frontend cart stores full pizza objects with prices, but checkout only sends IDs. Server **never trusts** client price.

---

## utils/importCatalog.js

**Runs once at server start** (after DB connect).

1. `Pizza.countDocuments()` — if > 0, log "already in database" and skip.
2. Else read `backend/data/pizzas.json` via `fs.readFileSync`.
3. `Pizza.insertMany(catalog)` — 8 pizzas in default file.
4. `ensureAdminUser()` — if `ADMIN_EMAIL` + `ADMIN_PASSWORD` in env and no user with that email → create `role: 'admin'`.

---

## data/pizzas.json

Static seed: 8 pizzas (Margherita, Farmhouse, Pepperoni, etc.) with prices in INR (299–599).

Fields match `Pizza` schema exactly — no `_id` (Mongo generates on insert).

---

## controllers/authController.js

### generateToken(user)

```js
jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### handleValidationErrors(req, res, next)

Used as middleware after `express-validator` rules. If errors → 400 with array of `{ field, message }`.

### register

1. Destructure `name, email, password` from `req.body`.
2. `User.findOne({ email })` — exists → 400 `"Email already registered"`.
3. `User.create({ name, email, password, role: 'customer' })` — triggers hash.
4. `generateToken(user)`.
5. 201 `{ success: true, data: { token, user: { id, name, email, role } } }`.

**Note:** Response uses `id: user._id` (stringified ObjectId).

### login

1. `User.findOne({ email }).select('+password')`.
2. `!user || !(await user.comparePassword(password))` → 401 `"Invalid email or password"` (same message for both — don't leak which failed).
3. Return token + user like register.

### getProfile

Requires `verifyToken` — returns `req.user` fields (no password).

### updateProfile

1. Load user with `select('+password')`.
2. Optionally update `name`, `email`, `password`.
3. `user.save()` — re-hashes if password modified.
4. Return updated user object.

---

## controllers/pizzaController.js

### getAllPizzas

- `filter = {}`
- If `req.user?.role !== 'admin'` → `filter.isAvailable = true`
- If `req.query.category` → `filter.category = req.query.category`
- `Pizza.find(filter).sort({ name: 1 })`
- Response: `{ success, count, data: pizzas[] }`

### getPizzaById

- `Pizza.findById(req.params.id)`
- Not found OR (unavailable AND not admin) → 404
- Else 200 `{ success, data: pizza }`

### createPizza / updatePizza / deletePizza

Admin only (enforced in routes). Standard CRUD with Mongoose validators on update (`runValidators: true`).

---

## controllers/orderController.js

### VALID_STATUSES

`['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered']`

### placeOrder

1. `validateAndBuildOrderItems(req.body.items)`
2. `Order.create({ customerId: req.user._id, items, totalAmount, deliveryAddress, status: 'Pending', paymentStatus: 'unpaid', paymentMethod: 'cod' })`
3. Populate customer + pizza names for response
4. 201

### getMyOrders

`Order.find({ customerId: req.user._id }).populate(...).sort({ createdAt: -1 })`

### getAllOrders

Admin — all orders, populated.

### updateOrderStatus

- Validates `status` in VALID_STATUSES
- `findByIdAndUpdate` with populate

### cancelOrder

1. Find order
2. Owner (`order.customerId === req.user._id`) OR admin
3. Else 403
4. `status !== 'Pending'` → 400
5. `findByIdAndDelete`

---

## controllers/paymentController.js

### getRazorpayInstance()

- Returns `null` if keys missing
- Throws if key doesn't start with `rzp_test_`
- Else `new Razorpay({ key_id, key_secret })`

### getPaymentConfig (public)

Returns `{ enabled, testMode, keyId, currency: 'INR' }`.

### createPaymentOrder

1. Get razorpay instance — 503 if not configured
2. `validateAndBuildOrderItems(req.body.items)`
3. `amountInPaise = Math.round(totalAmount * 100)` — Razorpay uses paise
4. Min 100 paise (₹1)
5. `receipt: 'pp' + Date.now()` (max 40 chars for Razorpay)
6. `razorpay.orders.create({ amount, currency, receipt, notes })`
7. Return `razorpayOrderId`, `amount`, `currency`, `keyId`, `totalAmount`

**Does NOT create Order document yet** — order created only after verify.

### verifyPayment

1. Require `RAZORPAY_KEY_SECRET`
2. Read `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `items`, `deliveryAddress`
3. HMAC: `sha256(order_id|payment_id, secret)` === signature
4. Check duplicate `Order.findOne({ razorpayOrderId })` — return existing if found
5. `validateAndBuildOrderItems` again (same cart data from client)
6. `Order.create` with `status: 'Confirmed'`, `paymentStatus: 'paid'`, `paymentMethod: 'razorpay'`, razorpay ids
7. 201 populated order

---

## routes/authRoutes.js

| Method | Path | Middleware | Handler |
|--------|------|------------|---------|
| POST | `/register` | validators + handleValidationErrors | register |
| POST | `/login` | validators + handleValidationErrors | login |
| GET | `/profile` | verifyToken | getProfile |
| PUT | `/profile` | verifyToken + validators | updateProfile |

Base path in server: `/api/auth` → full path `/api/auth/register`, etc.

---

## routes/pizzaRoutes.js

### optionalAuth

If `Authorization: Bearer` present → run `verifyToken`; else `next()` without user.

| Method | Path | Middleware | Handler |
|--------|------|------------|---------|
| GET | `/` | optionalAuth | getAllPizzas |
| GET | `/:id` | optionalAuth | getPizzaById |
| POST | `/` | verifyToken, isAdmin, validators | createPizza |
| PUT | `/:id` | verifyToken, isAdmin, validators | updatePizza |
| DELETE | `/:id` | verifyToken, isAdmin | deletePizza |

**Route order:** `GET /` before `GET /:id` so `/` isn't captured as id.

---

## routes/orderRoutes.js

| Method | Path | Middleware | Handler |
|--------|------|------------|---------|
| POST | `/` | verifyToken, validators | placeOrder |
| GET | `/my` | verifyToken | getMyOrders |
| GET | `/` | verifyToken, isAdmin | getAllOrders |
| PUT | `/:id/status` | verifyToken, isAdmin | updateOrderStatus |
| DELETE | `/:id` | verifyToken | cancelOrder |

**Note:** `GET /my` must be registered before `GET /` would conflict — actually `GET /my` is distinct from `GET /`.

---

## routes/paymentRoutes.js

Shared `orderItemsValidation` array for items array rules.

| Method | Path | Middleware | Handler |
|--------|------|------------|---------|
| GET | `/config` | none | getPaymentConfig |
| POST | `/create-order` | verifyToken, validators | createPaymentOrder |
| POST | `/verify` | verifyToken, validators + razorpay fields | verifyPayment |

---

## Backend request lifecycle (one diagram)

```
HTTP Request
  → helmet
  → cors (check Origin)
  → express.json() → req.body
  → morgan log
  → matched route
  → express-validator (if any)
  → handleValidationErrors (if any)
  → verifyToken / isAdmin / optionalAuth (if any)
  → controller function
  → Mongoose
  → JSON response
  OR next(err) → errorHandler
```

---

## package.json scripts

- `npm start` → `node server.js`
- `npm run dev` → `nodemon server.js` (restart on file change)

---

**Next:** [02-FRONTEND-FILE-BY-FILE.md](./02-FRONTEND-FILE-BY-FILE.md) | [03-INTEGRATIONS-AND-FLOWS.md](./03-INTEGRATIONS-AND-FLOWS.md)

---

## Code — source snippets & what they do

> Added: real project code + short explanation. Nothing above was removed.

### server.js — boot & routes

```js
require('dotenv').config();                    // load .env into process.env
const app = express();
app.use(helmet());                             // security headers
app.use(cors({ origin: fn, credentials: true })); // allow frontend origin
app.use(express.json());                       // req.body for POST JSON
app.use(requestLogger());                      // morgan logs

app.use('/api/auth', authRoutes);              // mount routers
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use(errorHandler);                         // MUST be last

await mongoose.connect(process.env.MONGO_URI);
await importCatalog();                         // seed menu if empty
app.listen(PORT);
```

### models/User.js — hash on save

```js
password: { type: String, required: true, minlength: 6, select: false },
// select: false → password not returned unless .select('+password')

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12); // hash before DB write
});
```

### models/Pizza.js — menu shape

```js
const pizzaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
});
```

### models/Order.js — line items + payment

```js
const orderItemSchema = new mongoose.Schema({
  pizza: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza', required: true },
  qty: { type: Number, required: true, min: 1 },
}, { _id: false });

status: { type: String, enum: ['Pending', 'Confirmed', ...], default: 'Pending' },
paymentStatus: { type: String, enum: ['unpaid', 'paid', 'failed'], default: 'unpaid' },
paymentMethod: { type: String, enum: ['razorpay', 'cod'], default: 'cod' },
```

### middleware/auth.js — JWT gate

```js
const token = authHeader.split(' ')[1];           // "Bearer TOKEN" → TOKEN
decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(decoded.id).select('-password');
req.user = user;                                  // controllers use req.user
next();

// isAdmin — after verifyToken
if (req.user.role !== 'admin') return res.status(403).json({ ... });
```

### utils/orderItems.js — server-side total

```js
for (const item of items) {
  const pizza = await Pizza.findById(item.pizza);
  if (!pizza || !pizza.isAvailable) throw error;  // 400 if bad/unavailable
  orderItems.push({ pizza: pizza._id, qty: item.qty });
  totalAmount += pizza.price * item.qty;          // price from DB, not client
}
return { orderItems, totalAmount };
```

### authController.js — login

```js
const user = await User.findOne({ email }).select('+password');
if (!user || !(await user.comparePassword(password)))
  return res.status(401).json({ message: 'Invalid email or password' });

const token = jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
res.json({ success: true, data: { token, user: { id, name, email, role } } });
```

### pizzaController.js — hide unavailable for customers

```js
const filter = {};
if (!req.user || req.user.role !== 'admin') filter.isAvailable = true;
if (req.query.category) filter.category = req.query.category;
const pizzas = await Pizza.find(filter).sort({ name: 1 });
```

### orderController.js — COD place

```js
const { orderItems, totalAmount } = await validateAndBuildOrderItems(items);
const order = await Order.create({
  customerId: req.user._id,
  items: orderItems,
  totalAmount,
  deliveryAddress,
  status: 'Pending',
  paymentStatus: 'unpaid',
  paymentMethod: 'cod',
});
```

### orderController.js — cancel rule

```js
const isOwner = order.customerId.toString() === req.user._id.toString();
if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ ... });
if (order.status !== 'Pending') return res.status(400).json({ message: 'Only pending...' });
await Order.findByIdAndDelete(order._id);
```

### paymentController.js — verify Razorpay signature

```js
const body = `${razorpay_order_id}|${razorpay_payment_id}`;
const expectedSignature = crypto.createHmac('sha256', keySecret).update(body).digest('hex');
if (expectedSignature !== razorpay_signature) return res.status(400).json({ ... });

const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
if (existingOrder) return res.status(200).json({ data: existingOrder }); // no duplicate

await Order.create({ ..., paymentStatus: 'paid', paymentMethod: 'razorpay', status: 'Confirmed' });
```

### pizzaRoutes.js — optionalAuth

```js
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization?.startsWith('Bearer '))
    return verifyToken(req, res, next);  // admin token → req.user set
  next();                                 // guest → no req.user
};
router.get('/', optionalAuth, getAllPizzas);
```

### authRoutes.js — validation chain

```js
router.post('/register',
  [ body('email').isEmail(), body('password').isLength({ min: 6 }) ],
  handleValidationErrors,  // stops here if invalid
  register               // only runs if body OK
);
router.get('/profile', verifyToken, getProfile);
```
