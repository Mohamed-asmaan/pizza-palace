# Pizza Palace — Documentation

> **The short guide was not enough.** Full project documentation (every file, every library, API JSON, line-by-line checkout/payment) lives in **`docs/`**.

## Start here

### [docs/INDEX.md](./docs/INDEX.md)

Master index + 2-hour reading plan + locator for all 47 source files.

## Full documentation set

| Document | What you get |
|----------|----------------|
| [docs/01-BACKEND-FILE-BY-FILE.md](./docs/01-BACKEND-FILE-BY-FILE.md) | Every backend file: server, models, middleware, routes, controllers, utils |
| [docs/02-FRONTEND-FILE-BY-FILE.md](./docs/02-FRONTEND-FILE-BY-FILE.md) | Every frontend file: Vite, CSS, store, context, api, all pages & components |
| [docs/03-INTEGRATIONS-AND-FLOWS.md](./docs/03-INTEGRATIONS-AND-FLOWS.md) | Every npm package + browser API; flows A–G with library labels; diagrams |
| [docs/04-API-DATA-AND-REVIEW.md](./docs/04-API-DATA-AND-REVIEW.md) | Request/response JSON, errors, localStorage, deploy, Q&A, 5-min script |
| [docs/05-LINE-BY-LINE-CHECKOUT-AND-PAYMENT.md](./docs/05-LINE-BY-LINE-CHECKOUT-AND-PAYMENT.md) | Screen-share walkthrough of Checkout + paymentController |

**Each doc file includes a `## Code — source snippets & what they do` section at the end** (real code + short explanations; existing text kept).

## Folder structure (source trees)

| App | Doc |
|-----|-----|
| Frontend | [frontend/STRUCTURE.md](./frontend/STRUCTURE.md) — `pages/public`, `pages/protected`, `pages/admin`, shared `components/`, `services/api.js` |
| Backend | [backend/STRUCTURE.md](./backend/STRUCTURE.md) — routes, controllers, middleware, models; same public / protected / admin access levels |

## Quick run

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:5000  
- Health: http://localhost:5000/api/health  

Copy `backend/.env.example` → `backend/.env` and set `MONGO_URI` + `JWT_SECRET` before starting backend.

---

*For review prep: read docs in order INDEX → 03 → 01 → 02 → 04, then practice demo + verbal script in doc 04.*
