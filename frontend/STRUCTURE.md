# Frontend folder structure

This app is a single-page React app (Vite + React Router). Folders are grouped by **role**, not by a generic `pages/` tree.

```
frontend/
├── public/              # Static assets (if any)
├── src/
│   ├── app/             # App shell: layout wiring + route table
│   ├── components/      # Shared UI used across features
│   ├── constants/       # App-wide fixed values (categories, order statuses)
│   ├── features/        # One folder per product area; route screens live here
│   ├── hooks/           # React context hooks (auth, cart)
│   ├── services/        # API client (axios)
│   ├── store/           # Redux slices and store
│   ├── utils/           # Pure helpers (formatting, Razorpay)
│   ├── index.css        # Global + Tailwind entry
│   └── main.jsx         # React entry (providers, router, mount)
├── index.html
├── package.json
└── vite.config.js       # `@` → `src/` alias
```

## `src/app/`

| File | Purpose |
|------|---------|
| `App.jsx` | Root layout: navbar, footer, auth init on load |
| `AppRoutes.jsx` | **Only place** that maps URLs → screen components |

Route-level screens are **not** stored under `app/`; they live in `features/` so each domain stays together.

## `src/components/`

Reusable pieces that **multiple features** share.

| Subfolder | Purpose |
|-----------|---------|
| `layout/` | Site chrome (`Navbar`, `Footer`) |
| `ui/` | Presentational widgets (`PizzaCard`, `EmptyState`, `SkeletonLoader`, `StatusBadge`) |
| `guards/` | Route wrappers (`ProtectedRoute`, `AdminRoute`) |

Feature-specific markup stays in `features/`, not here.

## `src/features/`

Each subfolder is a **business area**. Files here are **route screens** (full-page views), named after the page they render (e.g. `Menu.jsx` → `/menu`).

There is **no** `pages/` subfolder: the feature name already scopes the screen, and `app/AppRoutes.jsx` is the single route map.

| Feature | Screens | Routes |
|---------|---------|--------|
| `catalog/` | `Home`, `Menu`, `PizzaDetail` | `/`, `/menu`, `/pizza/:id` |
| `auth/` | `Auth` | `/auth` |
| `cart/` | `Cart`, `Checkout` | `/cart`, `/checkout` (login required) |
| `orders/` | `Orders` | `/orders` (login required) |
| `admin/` | `AdminDashboard`, `AdminPizzas`, `AdminOrders` | `/admin`, `/admin/pizzas`, `/admin/orders` (admin only) |

If a feature grows large later, add colocated helpers under the same folder, e.g. `catalog/components/FilterBar.jsx` — still not a global `pages/` directory.

## `src/constants/`

Values that are fixed in the UI and shared in multiple places (not fetched from the API).

| File | Exports |
|------|---------|
| `catalog.js` | Menu category filters |
| `orders.js` | Order status list and badge colors |

## `src/hooks/`

`useAuth.js` and `useCart.js` expose React context + Redux actions to components.

## `src/services/`

`api.js` — all HTTP calls to the backend (`/api/...` via Vite proxy).

## `src/store/`

Redux Toolkit: `authSlice`, `cartSlice`, `store.js`.

## `src/utils/`

Stateless helpers (`formatPrice`, Razorpay checkout). No React imports.

## Import alias

Use `@/` for anything under `src/`:

```js
import Home from '@/features/catalog/Home';
import { formatPrice } from '@/utils/format';
```

## Adding a new screen

1. Create `src/features/<area>/<ScreenName>.jsx`.
2. Register the path in `src/app/AppRoutes.jsx`.
3. Add nav link in `src/components/layout/Navbar.jsx` if it should appear in the menu.
4. Wrap with `ProtectedRoute` or `AdminRoute` in `AppRoutes.jsx` when access must be restricted.
