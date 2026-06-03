# Frontend folder structure

Single-page React app (Vite + React Router). Pages are grouped by **access level**; shared UI and API live alongside.

```
frontend/
├── public/              # Static assets (Vite public/)
├── src/
│   ├── app/             # App shell + route table
│   ├── pages/           # Route screens (3 access groups)
│   │   ├── public/      # Anyone
│   │   ├── protected/   # Logged-in customer
│   │   └── admin/       # Admin only
│   ├── components/      # Shared UI (layout, ui, guards)
│   ├── constants/       # Fixed values (categories, order statuses)
│   ├── hooks/           # AuthProvider, CartProvider, useAuth, useCart
│   ├── services/        # API client (axios) — api.js
│   ├── store/           # Redux (authSlice, cartSlice, store.js)
│   ├── utils/           # format, Razorpay helpers
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js       # `@` → `src/`
```

## `src/pages/`

| Folder | Screens | Routes |
|--------|---------|--------|
| **public/** | `Home`, `Menu`, `PizzaDetail`, `Auth` | `/`, `/menu`, `/pizza/:id`, `/auth` |
| **protected/** | `Cart`, `Checkout`, `Orders` | `/cart`, `/checkout`, `/orders` |
| **admin/** | `AdminDashboard`, `AdminPizzas`, `AdminOrders` | `/admin`, `/admin/pizzas`, `/admin/orders` |

Guards (`ProtectedRoute`, `AdminRoute`) are applied in `app/AppRoutes.jsx`, not inside each page file.

## `src/components/` (shared)

| Subfolder | Purpose |
|-----------|---------|
| `layout/` | `Navbar`, `Footer` |
| `ui/` | `PizzaCard`, `EmptyState`, `SkeletonLoader`, `StatusBadge` |
| `guards/` | `ProtectedRoute`, `AdminRoute` |

## `src/services/`

`api.js` — axios instance + `authAPI`, `pizzaAPI`, `orderAPI`, `paymentAPI`.

## `src/hooks/` / `src/store/` / `src/constants/` / `src/utils/`

Unchanged roles: Redux auth/cart, providers, catalog/order constants, formatting and Razorpay.

## Import alias

```js
import Home from '@/pages/public/Home';
import Cart from '@/pages/protected/Cart';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import { pizzaAPI } from '@/services/api';
import PizzaCard from '@/components/ui/PizzaCard';
```

## Adding a new screen

1. Add `ScreenName.jsx` under `pages/public`, `pages/protected`, or `pages/admin`.
2. Register the route in `src/app/AppRoutes.jsx`.
3. Use `ProtectedRoute` or `AdminRoute` in `AppRoutes.jsx` when needed.
4. Add a nav link in `components/layout/Navbar.jsx` if required.
