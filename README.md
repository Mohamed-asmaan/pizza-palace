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

| Layer    | Platform       |
|----------|----------------|
| Frontend | Vercel         |
| Backend  | Render         |
| Database | MongoDB Atlas  |

Set environment variables on Render: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`

Set on Vercel: `VITE_API_URL=https://your-api.onrender.com/api`

## Tests

```bash
cd backend && npm test
cd frontend && npm test
```
