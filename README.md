# Pizza Palace

Full-stack pizza ordering app with customer checkout, order history, and an admin dashboard. Built with the MERN stack and Razorpay test payments.

## Features

**Customers**
- Browse menu with category filters
- View pizza details and add items to cart
- Register / login with JWT authentication
- Checkout with Razorpay (test mode) or cash on delivery
- View and cancel orders

**Admins**
- Dashboard overview
- Manage pizzas (create, edit, delete, availability)
- View all orders and update order status

**Platform**
- Auto-seeds menu on first backend start (empty database)
- Optional auto-creation of an admin account via env vars
- Protected routes for logged-in users; admin-only routes for management pages
- Cart persisted in `localStorage`; auth session persisted across refresh

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, Vite, React Router, Redux Toolkit, Tailwind CSS, Axios, Framer Motion |
| Backend | Node.js, Express 5, MongoDB, Mongoose, JWT, bcrypt, express-validator |
| Payments | Razorpay (test keys) |
| Deploy | Vercel (frontend), Render (API) |

## Project Structure

```
Pizza Ecom/
├── backend/                 # Express API
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth, validation, errors
│   ├── models/              # User, Pizza, Order
│   ├── routes/              # auth, pizzas, orders, payments
│   ├── utils/               # Catalog seed, order helpers
│   └── server.js            # App entry point
├── frontend/                # React SPA
│   └── src/
│       ├── app/             # App shell + routes
│       ├── components/      # Layout, UI, route guards
│       ├── hooks/           # useAuth, useCart
│       ├── pages/           # public / protected / admin
│       ├── services/        # Axios API client
│       ├── store/           # Redux slices
│       └── utils/           # Formatting, Razorpay helpers
└── vercel.json              # Frontend deploy config
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Razorpay test keys (optional — without them checkout uses COD only)

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd "Pizza Ecom"

cd backend && npm install
cd ../frontend && npm install
```

### 2. Backend environment

Copy `backend/.env.example` to `backend/.env` and configure:

```env
MONGO_URI=mongodb://localhost:27017/pizza-palace
JWT_SECRET=your_secret_here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Optional — enables Razorpay test checkout
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret

# Optional — creates admin on first run if no user exists
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123456
ADMIN_NAME=Admin
```

Start the API:

```bash
cd backend
npm run dev
```

The server runs at `http://localhost:5000`. Health check: `GET /api/health`.

On first connect to an empty database, the backend seeds default pizzas automatically.

### 3. Frontend environment

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

### 4. Create accounts

- **Customer:** register at `/auth`
- **Admin:** set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in backend `.env` and restart, or manually set `role: "admin"` on a user in MongoDB

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| `backend/` | `npm run dev` | Start API with nodemon |
| `backend/` | `npm start` | Start API (production) |
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run build` | Production build → `frontend/dist` |
| `frontend/` | `npm run preview` | Preview production build |

## Frontend Routes

| Path | Access | Page |
|------|--------|------|
| `/` | Public | Home |
| `/menu` | Public | Menu |
| `/pizza/:id` | Public | Pizza detail |
| `/auth` | Public | Login / register |
| `/cart` | Logged in | Cart |
| `/checkout` | Logged in | Checkout |
| `/orders` | Logged in | My orders |
| `/admin` | Admin | Dashboard |
| `/admin/pizzas` | Admin | Manage menu |
| `/admin/orders` | Admin | Manage orders |

Route guards live in `frontend/src/components/guards/` (`ProtectedRoute`, `AdminRoute`). Auth state is managed via Redux (`useAuth` hook + `authSlice`).

## API Overview

Base URL: `/api`

| Group | Endpoints |
|-------|-----------|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `GET /auth/profile`, `PUT /auth/profile` |
| **Pizzas** | `GET /pizzas`, `GET /pizzas/:id`, `POST /pizzas` (admin), `PUT /pizzas/:id` (admin), `DELETE /pizzas/:id` (admin) |
| **Orders** | `POST /orders`, `GET /orders/my`, `GET /orders` (admin), `PUT /orders/:id/status` (admin), `DELETE /orders/:id` |
| **Payments** | `GET /payments/config`, `POST /payments/create-order`, `POST /payments/verify` |

Authenticated requests send `Authorization: Bearer <token>`. The frontend attaches the token automatically from `localStorage`.

## Deployment

**Frontend (Vercel)** — `vercel.json` builds from `frontend/` and serves the SPA with client-side routing.

Set in Vercel:

```env
VITE_API_URL=https://your-api.onrender.com/api
```

**Backend (Render or similar)** — deploy `backend/` with:

- `MONGO_URI` (Atlas connection string)
- `JWT_SECRET`
- `CLIENT_URL` (comma-separated frontend URLs for CORS)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (optional)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` (optional)

## Payment Flow

1. Checkout calls `GET /payments/config` to check if Razorpay is enabled.
2. If enabled: create Razorpay order → open checkout widget → verify signature → save order.
3. If disabled: place order directly with `POST /orders` (cash on delivery).

## License

ISC (backend package). See individual `package.json` files for details.
