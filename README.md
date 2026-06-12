# 🍕 Pizza Palace

A full-stack pizza ordering web application built with the **MERN stack**. Customers can browse the menu, manage a cart, and pay online with Razorpay, while admins manage pizzas and orders from a dedicated dashboard.

**Live demo:** [pizza-palace-gules.vercel.app](https://pizza-palace-gules.vercel.app)

---

## Features

- 🛒 Browse pizzas by category, view details, and add to cart
- 🔐 JWT-based register / login with persistent sessions
- 💳 Online payments via Razorpay (test mode) or cash on delivery
- 📦 Order history with status tracking and cancellation
- 🛠️ Admin dashboard — manage pizzas, availability, and order statuses
- 🌱 Auto-seeds the menu on first run with an empty database

## Tech Stack

| Layer    | Technologies                                                          |
| -------- | --------------------------------------------------------------------- |
| Frontend | React 19, Vite, Redux Toolkit, React Router 7, Tailwind CSS, Axios    |
| Backend  | Node.js, Express 5, MongoDB, Mongoose, JWT, bcrypt, express-validator |
| Payments | Razorpay                                                              |
| Hosting  | Vercel (frontend) · Render (API)                                      |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- Razorpay test keys *(optional — checkout falls back to cash on delivery)*

### 1. Clone & install

```bash
git clone https://github.com/Mohamed-asmaan/pizza-palace.git
cd pizza-palace

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure the backend

Create `backend/.env` (see `backend/.env.example`):

```env
MONGO_URI=mongodb://localhost:27017/pizza-palace
JWT_SECRET=your_secret_here
PORT=5000
CLIENT_URL=http://localhost:5173

# Optional — Razorpay test checkout
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret

# Optional — auto-create an admin on first run
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123456
```

### 3. Configure the frontend

Create `frontend/.env` (see `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run

```bash
# Terminal 1 — API on http://localhost:5000
cd backend && npm run dev

# Terminal 2 — app on http://localhost:5173
cd frontend && npm run dev
```

The backend seeds default pizzas automatically when the database is empty. Health check: `GET /api/health`.

## API Endpoints

Base URL: `/api` — authenticated routes expect `Authorization: Bearer <token>`.

| Group    | Endpoints                                                                                  |
| -------- | ------------------------------------------------------------------------------------------ |
| Auth     | `POST /auth/register` · `POST /auth/login` · `GET /auth/profile` · `PUT /auth/profile`      |
| Pizzas   | `GET /pizzas` · `GET /pizzas/:id` · `POST /pizzas`* · `PUT /pizzas/:id`* · `DELETE /pizzas/:id`* |
| Orders   | `POST /orders` · `GET /orders/my` · `GET /orders`* · `PUT /orders/:id/status`* · `DELETE /orders/:id` |
| Payments | `GET /payments/config` · `POST /payments/create-order` · `POST /payments/verify`            |

\* Admin only

## App Routes

| Path            | Access    | Page                  |
| --------------- | --------- | --------------------- |
| `/`             | Public    | Home                  |
| `/menu`         | Public    | Menu                  |
| `/pizza/:id`    | Public    | Pizza details         |
| `/auth`         | Public    | Login / register      |
| `/cart`         | Logged in | Cart                  |
| `/checkout`     | Logged in | Checkout              |
| `/orders`       | Logged in | My orders             |
| `/admin`        | Admin     | Dashboard             |
| `/admin/pizzas` | Admin     | Manage menu           |
| `/admin/orders` | Admin     | Manage orders         |

## Project Structure

```
pizza-palace/
├── backend/             # Express REST API
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # User, Pizza, Order schemas
│   ├── routes/          # auth, pizzas, orders, payments
│   ├── utils/           # Menu seeding, order helpers
│   └── server.js        # Entry point
├── frontend/            # React SPA (Vite)
│   └── src/
│       ├── app/         # App shell + routing
│       ├── components/  # Layout, UI, route guards
│       ├── hooks/       # useAuth, useCart
│       ├── pages/       # public / protected / admin
│       ├── services/    # Axios API client
│       ├── store/       # Redux slices
│       └── utils/       # Formatters, Razorpay helpers
└── vercel.json          # Frontend deploy config
```

## Deployment

- **Frontend (Vercel):** builds from `frontend/` via `vercel.json`. Set `VITE_API_URL` to your deployed API URL.
- **Backend (Render or similar):** deploy `backend/` with `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` (comma-separated frontend URLs for CORS). Razorpay and admin variables are optional.

## License

ISC
