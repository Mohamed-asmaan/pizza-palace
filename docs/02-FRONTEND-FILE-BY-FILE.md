# Frontend — Every File Explained (Complete)

Frontend root: `frontend/`  
Entry: `index.html` → `src/main.jsx`  
Build tool: **Vite** | UI: **React 19** | Styling: **Tailwind**

---

## index.html

- `#root` div — React mounts here.
- Google Fonts: Inter (UI), JetBrains Mono (mono if needed).
- Favicon: `/pizza-icon.svg`
- Script: `type="module" src="/src/main.jsx"` — Vite resolves this.

---

## vite.config.js

```js
plugins: [react()]  // @vitejs/plugin-react — Fast Refresh, JSX transform
server.port: 5173
proxy: '/api' → 'http://localhost:5000'
```

**Proxy vs api.js:**  
`api.js` uses full URL `http://localhost:5000/api` in dev, so proxy is **optional** (useful if you changed api to relative `/api`). Production build does not use dev proxy.

---

## tailwind.config.js

- `content`: scans `index.html` + all `src/**/*.{js,jsx}` for class names (purge unused CSS in build).
- **Custom colors:**
  - `primary`: `#C0392B` (red)
  - `secondary`: `#E67E22` (orange)
  - `neutral.light` / `neutral.dark`

Used as `bg-primary`, `text-primary`, etc.

---

## postcss.config.js

Pipeline: Tailwind → Autoprefixer (vendor prefixes for CSS).

---

## src/index.css

### @layer base

- `body`: light gray bg, dark text, Inter font, antialiased.
- `focus-visible`: ring for keyboard accessibility.

### @layer components (reusable classes)

| Class | Purpose |
|-------|---------|
| `.btn-primary` | Red CTA button |
| `.btn-secondary` | Orange secondary button |
| `.input-field` | Full-width bordered input |
| `.card` | White rounded shadow container |

Every page uses these — consistent UI without duplicating Tailwind strings.

---

## main.jsx — Application shell

**Provider nesting (outer → inner):**

1. `React.StrictMode` — double-invokes effects in dev to find bugs.
2. `Provider store={store}` — Redux available everywhere.
3. `BrowserRouter` — HTML5 history routing (`/menu`, not `#/menu`).
4. `AuthProvider` — passthrough children; real logic in `useAuth` hook.
5. `CartProvider` — same for cart.
6. `App` — routes + layout.
7. `Toaster` — global toast container (top-right, 3s default).

---

## App.jsx

### useEffect on mount

```js
dispatch(initializeAuth());
```

Runs once when app loads — validates token with backend before showing protected routes.

### Layout structure

```
div.min-h-screen.flex.flex-col
  Navbar (sticky)
  main.flex-1
    Routes ...
  Footer (mt-auto — sticks to bottom on short pages)
```

### Route table (complete)

| Path | Component | Guard | Who sees it |
|------|-----------|-------|-------------|
| `/` | Home | — | Everyone |
| `/menu` | Menu | — | Everyone |
| `/pizza/:id` | PizzaDetail | — | Everyone |
| `/auth` | Auth | — | Everyone |
| `/cart` | Cart | ProtectedRoute | Logged-in only |
| `/checkout` | Checkout | ProtectedRoute | Logged-in only |
| `/orders` | Orders | ProtectedRoute | Logged-in only |
| `/admin` | AdminDashboard | AdminRoute | Admin only |
| `/admin/pizzas` | AdminPizzas | AdminRoute | Admin only |
| `/admin/orders` | AdminOrders | AdminRoute | Admin only |

---

## services/api.js — The HTTP layer

### baseURL resolution (order matters)

1. Default dev: `http://localhost:5000/api`
2. If `import.meta.env.PROD` (production build): Render URL
3. If `VITE_API_URL` set: **overrides** both (see `.env.production`)

### Request interceptor

Every outgoing request:

```js
if (token) config.headers.Authorization = 'Bearer ' + token;
```

Token key in localStorage: **`token`** (plain string).

### Response interceptor

On **401**: remove `token` and `user` from localStorage. Does NOT redirect — `ProtectedRoute` / next navigation handles that.

### API object methods (exact endpoints)

**authAPI**

| Method | HTTP | Path |
|--------|------|------|
| register(data) | POST | /auth/register |
| login(data) | POST | /auth/login |
| getProfile() | GET | /auth/profile |
| updateProfile(data) | PUT | /auth/profile |

**pizzaAPI**

| Method | HTTP | Path |
|--------|------|------|
| getAll(params) | GET | /pizzas?category=... |
| getById(id) | GET | /pizzas/:id |
| create(data) | POST | /pizzas |
| update(id, data) | PUT | /pizzas/:id |
| delete(id) | DELETE | /pizzas/:id |

**orderAPI**

| Method | HTTP | Path |
|--------|------|------|
| place(data) | POST | /orders |
| getMyOrders() | GET | /orders/my |
| getAllOrders() | GET | /orders |
| updateStatus(id, status) | PUT | /orders/:id/status |
| cancel(id) | DELETE | /orders/:id |

**paymentAPI**

| Method | HTTP | Path |
|--------|------|------|
| getConfig() | GET | /payments/config |
| createOrder(data) | POST | /payments/create-order |
| verify(data) | POST | /payments/verify |

Axios wraps responses in `res.data` — backend body is usually `res.data.data` for entities.

---

## store/store.js

```js
configureStore({ reducer: { auth: authReducer, cart: cartReducer } })
```

No middleware configured (no redux-thunk beyond RTK's built-in for createAsyncThunk).

**State shape:**

```js
{
  auth: { user: null | { id, name, email, role }, loading: boolean },
  cart: { items: [{ pizza: {...}, qty: number }] }
}
```

---

## store/authSlice.js

### Initial state

- `user`: parsed from `localStorage.getItem('user')` or null
- `loading: true` until `initializeAuth` completes

### Synchronous reducers

| Action | Effect |
|--------|--------|
| `setAuth({ token, user })` | Save token + user JSON to localStorage; set state.user; loading false |
| `logoutUser` | Clear localStorage; user null |
| `updateAuthUser(user)` | Replace user in state + localStorage |

### initializeAuth async thunk

| State | Behavior |
|-------|----------|
| pending | loading true |
| fulfilled | user from API or null; sync localStorage user |
| rejected | clear token + user; user null; loading false |

**Why both token AND profile call?**  
Token proves identity; profile ensures user still exists and returns fresh role/name.

---

## store/cartSlice.js

### Storage key: `pizza_palace_cart`

### getStoredCart / saveCart

JSON parse/stringify with try/catch — corrupt data → empty array.

### addItem

- Match by `pizza._id`
- Duplicate → increment `qty`
- New → push `{ pizza, qty }`
- Always `saveCart(state.items)`

### updateItemQty

- `qty < 1` → remove line
- Else update qty on matching id

### removeItem

Filter out by pizzaId.

### clearAllItems

Empty array + save — called after successful checkout.

**Cart stores full pizza object** (name, price, image) so Cart/Checkout UI doesn't need extra API calls.

---

## context/AuthContext.jsx

```js
export const AuthProvider = ({ children }) => children;
```

No Context.Provider value — **intentionally thin**. All state lives in Redux.

`useAuth()` returns:

- `user`, `loading`
- `isAdmin`, `isAuthenticated` (computed booleans)
- `login(token, userData)` → dispatch setAuth
- `logout()` → dispatch logoutUser
- `updateUser(userData)` → dispatch updateAuthUser

**Interview line:** "Context is a facade over Redux so pages import one hook instead of coupling to slice details."

---

## context/CartContext.jsx

Same pattern. Additionally computes:

```js
total = sum(item.pizza.price * item.qty)
itemCount = sum(item.qty)
```

Exposes `addToCart`, `updateQuantity`, `removeFromCart`, `clearCart`.

---

## utils/format.js

| Export | Implementation |
|--------|----------------|
| `formatPrice(n)` | `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })` → "₹299" |
| `formatDate(d)` | medium date + short time |
| `ORDER_STATUSES` | array for admin dropdown |
| `CATEGORIES` | `['All', 'Veg', 'Non-Veg', 'Specialty']` |
| `getStatusColor(status)` | Tailwind classes for StatusBadge |

---

## utils/razorpay.js

### loadRazorpayScript()

- If `window.Razorpay` exists → resolve true
- Else inject `<script src="https://checkout.razorpay.com/v1/checkout.js">`
- onload → true, onerror → false

### openRazorpayCheckout({ keyId, amount, currency, orderId, user, onSuccess, onDismiss })

Returns Promise:

- **resolve:** handler called with `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
- **reject:** user closed modal (`Payment cancelled`) or `payment.failed` event

**amount:** already in **paise** from backend (do not multiply again on frontend).

**theme.color:** `#E63946` — brand red for Razorpay modal.

---

## Components

### Navbar.jsx

**Hooks:** `useAuth()`, `useCart()`

**Desktop nav:** Home, Menu, Orders (if auth), Admin (if admin).

**Cart link:** only if `isAuthenticated` — badge shows `itemCount` with framer-motion scale animation.

**Auth area:** Login button OR "Hi, {firstName}" + Logout.

`NavLink` with `navLinkClass` — active route gets `bg-primary text-white`.

---

### ProtectedRoute.jsx

1. If `loading` → SkeletonLoader (avoid flash redirect before profile check).
2. If `!isAuthenticated` → `<Navigate to="/auth" state={{ from: location }} />`
3. Else render `children`

**Return URL flow:** Auth reads `location.state?.from?.pathname` after login.

---

### AdminRoute.jsx

1. loading → skeleton
2. !authenticated → `/auth`
3. authenticated but !admin → `/` (home, not login)
4. else children

---

### PizzaCard.jsx

- `Link` to `/pizza/${pizza._id}`
- Shows image, name, category badge, description (2-line clamp), price
- `motion.div` fade-up animation
- Does NOT add to cart — detail page does

---

### EmptyState.jsx

Props: `icon`, `title`, `description`, `actionLabel`, `actionLink`

Used: empty cart, no menu results, no orders, admin empty orders.

---

### SkeletonLoader.jsx

Props:

- `count` — number of placeholders
- `type` — `'card'` (grid of fake cards) or `'table'` (rows)

`animate-pulse` + gray blocks.

---

### StatusBadge.jsx

Renders `status` text with `getStatusColor(status)` background classes.

---

### Footer.jsx

Static copyright + brand. `mt-auto` in flex layout pushes footer down.

---

## Pages (every page in detail)

### Home.jsx

**State:** `pizzas[]`, `loading`

**useEffect:** `pizzaAPI.getAll()` → `slice(0, 4)` for featured only.

**Sections:**

1. Hero gradient — framer-motion headline + link to `/menu`
2. Featured grid — PizzaCard × 4 or SkeletonLoader

**Does not use Redux cart.**

---

### Menu.jsx

**State:** `pizzas`, `loading`, `category` (default `'All'`), `search`

**Category:** changes → new API call with `params: { category }` if not All.

**Search:** client-side `useMemo` filter on name, description, category (no debounce, no API).

**Empty:** EmptyState with reset to menu.

---

### PizzaDetail.jsx

**Params:** `id` from `useParams()`

**Fetch:** `pizzaAPI.getById(id)` — fail → toast + navigate `/menu`

**State:** `qty` (local, default 1)

**handleAddToCart:**

1. If !authenticated → toast + navigate `/auth` with `state.from` = this pizza URL
2. Else `addToCart(pizza, qty)` + success toast

**UI:** image, category, description, price, qty stepper, "Add to Cart — ₹total"

---

### Cart.jsx

**Protected** — must login.

**Empty:** EmptyState → Browse Menu.

**Each line:** image, name, unit price, qty +/- , line total, remove (toast on remove).

**Footer card:** order total + Link to `/checkout`.

Uses `motion.div` `layout` for list animations.

---

### Checkout.jsx

**Protected.**

**On mount:** `paymentAPI.getConfig()` → sets `paymentEnabled`, `testMode`.

**Guard:** if `items.length === 0` → `navigate('/cart')` immediately.

**orderItems payload:**

```js
items.map(({ pizza, qty }) => ({ pizza: pizza._id, qty }))
```

### placeCodOrder()

`orderAPI.place({ items, deliveryAddress })` → clearCart → toast → `/orders`

### placeRazorpayOrder()

1. loadRazorpayScript
2. paymentAPI.createOrder({ items })
3. openRazorpayCheckout with keyId, amount, orderId
4. paymentAPI.verify({ items, deliveryAddress, razorpay_* })
5. clearCart → toast → `/orders`

### handlePlaceOrder

- Validates address trim non-empty
- Branch on `paymentEnabled`
- Catches errors — ignores message if user cancelled payment
- Shows API message or first validation error

**UI:** address textarea, payment info box (test card hint), order summary sidebar.

---

### Orders.jsx

**Protected.**

`orderAPI.getMyOrders()` on mount.

**Each order card:**

- Short id: last 8 chars of `_id` uppercase
- `formatDate(createdAt)`
- StatusBadge
- Line items from populated `item.pizza.name`
- Delivery address, payment label logic:
  - paid → "Paid via Razorpay"
  - cod → "Cash on delivery"
  - else "Unpaid"
- Cancel button **only if** `status === 'Pending'`

---

### Auth.jsx

**State:** `tab` ('login' | 'register'), `form` { name, email, password }, `loading`

**from:** `location.state?.from?.pathname || '/'`

**Submit:**

- login or register API
- `login(token, user)` from useAuth
- navigate: admin → `/admin`, else `from`

**Tabs:** role="tablist" for accessibility.

Register shows name field only on register tab.

---

### AdminDashboard.jsx

**AdminRoute protected.**

`orderAPI.getAllOrders()` once.

**Stats computed client-side:**

- totalOrders = length
- pendingOrders = status === Pending
- activeOrders = not Delivered and not Pending
- totalRevenue = sum totalAmount where status === Delivered

**Quick action links** to pizzas and orders admin pages.

---

### AdminPizzas.jsx

**fetchPizzas:** `pizzaAPI.getAll()` — admin token shows unavailable items too.

**Modal form:** create or edit — fields match Pizza schema.

**toggleAvailability:** PUT with only `{ isAvailable: !current }`

**delete:** confirm dialog → DELETE

**AnimatePresence** for modal enter/exit.

---

### AdminOrders.jsx

Table: order id snippet, customer name/email, items list, total, StatusBadge, status `<select>`.

On change → `updateStatus(orderId, newStatus)`.

Cancel link for Pending orders (same API as customer cancel).

---

## localStorage keys (frontend)

| Key | Content |
|-----|---------|
| `token` | JWT string |
| `user` | JSON string `{ id, name, email, role }` |
| `pizza_palace_cart` | JSON array of `{ pizza, qty }` |

---

## Component dependency graph

```
main.jsx
  └── App.jsx
        ├── Navbar → useAuth, useCart
        ├── Routes
        │     ├── Home → pizzaAPI, PizzaCard
        │     ├── Menu → pizzaAPI, PizzaCard, SkeletonLoader, EmptyState
        │     ├── PizzaDetail → pizzaAPI, useCart, useAuth
        │     ├── Cart → useCart, EmptyState
        │     ├── Checkout → useCart, useAuth, orderAPI, paymentAPI, razorpay.js
        │     ├── Orders → orderAPI, StatusBadge
        │     ├── Auth → authAPI, useAuth
        │     └── Admin* → orderAPI / pizzaAPI, AdminRoute
        └── Footer
```

---

**Next:** [03-INTEGRATIONS-AND-FLOWS.md](./03-INTEGRATIONS-AND-FLOWS.md) | [04-API-DATA-AND-REVIEW.md](./04-API-DATA-AND-REVIEW.md)

---

## Code — source snippets & what they do

> Added: real project code + short explanation. Nothing above was removed.

### main.jsx — provider stack

```jsx
<Provider store={store}>           {/* Redux global state */}
  <BrowserRouter>                  {/* URL routing */}
    <AuthProvider>
      <CartProvider>
        <App />
        <Toaster position="top-right" />  {/* toast notifications */}
```

### App.jsx — session + routes

```jsx
useEffect(() => { dispatch(initializeAuth()); }, [dispatch]);
// On load: if token in localStorage → GET /auth/profile → set user

<Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
<Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
```

### services/api.js — JWT on every request

```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});
// 401 → clear token + user (session dead)
api.interceptors.response.use((r) => r, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  return Promise.reject(error);
});
```

### store/authSlice.js — persist login

```js
setAuth: (state, action) => {
  const { token, user } = action.payload;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  state.user = user;
},
export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  if (!localStorage.getItem('token')) return { user: null };
  const res = await authAPI.getProfile();  // validates JWT with backend
  return { user: res.data.data };
});
```

### store/cartSlice.js — persist cart

```js
addItem: (state, action) => {
  const { pizza, qty = 1 } = action.payload;
  const existing = state.items.find((it) => it.pizza._id === pizza._id);
  if (existing) existing.qty += qty;
  else state.items.push({ pizza, qty });
  localStorage.setItem('pizza_palace_cart', JSON.stringify(state.items));
},
```

### context/AuthContext.jsx — hook wrapper

```jsx
export const useAuth = () => {
  const user = useSelector((state) => state.auth.user);
  return {
    isAuthenticated: Boolean(user),
    isAdmin: Boolean(user?.role === 'admin'),
    login: (token, userData) => dispatch(setAuth({ token, user: userData })),
    logout: () => dispatch(logoutUser()),
  };
};
```

### ProtectedRoute.jsx — block guests

```jsx
if (loading) return <SkeletonLoader />;
if (!isAuthenticated)
  return <Navigate to="/auth" state={{ from: location }} replace />;
return children;
```

### PizzaDetail.jsx — add to cart

```jsx
if (!isAuthenticated) {
  navigate('/auth', { state: { from: { pathname: `/pizza/${id}` } } });
  return;
}
addToCart(pizza, qty);  // Redux + localStorage
```

### Checkout.jsx — map cart → API + COD vs Razorpay

```jsx
const orderItems = items.map(({ pizza, qty }) => ({ pizza: pizza._id, qty }));

const placeCodOrder = async () => {
  await orderAPI.place({ items: orderItems, deliveryAddress: deliveryAddress.trim() });
  clearCart();
  navigate('/orders');
};

const placeRazorpayOrder = async () => {
  const { razorpayOrderId, amount, currency, keyId } =
    (await paymentAPI.createOrder({ items: orderItems })).data.data;
  const paymentResponse = await openRazorpayCheckout({ keyId, amount, currency, orderId: razorpayOrderId, user });
  await paymentAPI.verify({ items: orderItems, deliveryAddress, ...paymentResponse });
  clearCart();
  navigate('/orders');
};
```

### Auth.jsx — login flow

```jsx
const res = await authAPI.login({ email, password });
const { token, user } = res.data.data;
login(token, user);  // Redux + localStorage
navigate(user.role === 'admin' ? '/admin' : from);
```

### utils/razorpay.js — load SDK + popup

```js
const script = document.createElement('script');
script.src = 'https://checkout.razorpay.com/v1/checkout.js';
const razorpay = new window.Razorpay({ key, amount, order_id, handler: (res) => resolve(res) });
razorpay.open();
```

### Menu.jsx — fetch + client search

```jsx
useEffect(() => {
  pizzaAPI.getAll(category !== 'All' ? { category } : {})
    .then((res) => setPizzas(res.data.data));
}, [category]);

const filteredPizzas = useMemo(() =>
  pizzas.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())), [pizzas, search]);
```

### AdminOrders.jsx — status update

```jsx
await orderAPI.updateStatus(orderId, e.target.value);
fetchOrders();  // refresh table
```

### index.css — shared UI classes

```css
.btn-primary { @apply bg-primary hover:bg-red-700 text-white ...; }
.card { @apply bg-white rounded-xl shadow-md overflow-hidden; }
```
