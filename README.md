# Pizza Palace

MERN Stack Online Food Ordering Platform — Student Developer Edition (SRS v1.0)

## Tech Stack

- **Frontend:** React, Tailwind CSS, Context API, React Router, Framer Motion
- **Backend:** Node.js, Express.js, JWT, bcryptjs
- **Database:** MongoDB + Mongoose

## Project Structure

```
backend/     Express REST API
frontend/    React SPA
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm run seed    # Seed admin, demo customer, and sample pizzas
npm run dev     # Start on http://localhost:5000
```

**Default credentials (after seed):**
- Admin: `admin@pizzapalace.com` / `admin123`
- Customer: `customer@pizzapalace.com` / `customer123`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start       # Start on http://localhost:5173
```

## API Base URL

`http://localhost:5000/api`

Auth header: `Authorization: Bearer <token>`

## Deployment

| Layer    | Platform       | URL |
|----------|----------------|-----|
| Frontend | Vercel         | https://pizza-palace-gules.vercel.app |
| Backend  | Render         | https://pizza-palace-api-6udi.onrender.com |
| Database | MongoDB Atlas  | `pizza-palace` database |

**Render** environment variables:
- `MONGO_URI` — Atlas connection string with `/pizza-palace`
- `JWT_SECRET` — long random secret
- `NODE_ENV` — `production`
- `CLIENT_URL` — `https://pizza-palace-gules.vercel.app`

**Vercel** — API URL is configured in code (`frontend/.env.production` and `frontend/src/services/api.js`). No dashboard env vars required.

**Vercel** live URL: https://pizza-palace-gules.vercel.app

**Render** live API: https://pizza-palace-api-6udi.onrender.com/api

## Tests

```bash
cd backend && npm test
cd frontend && npm test
```
