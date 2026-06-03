# Pizza Palace — Complete Documentation Index

> **You asked for 100% of the project, not a summary.**  
> This `docs/` folder is the full breakdown: **every source file**, **every library integration with code**, **API request/response shapes**, and **step-by-step sequences**.

## How to use before your review (2 hours)

| Time | Read |
|------|------|
| 0–20 min | [03-INTEGRATIONS-AND-FLOWS.md](./03-INTEGRATIONS-AND-FLOWS.md) — how Redux, JWT, MongoDB, Razorpay connect |
| 20–50 min | [01-BACKEND-FILE-BY-FILE.md](./01-BACKEND-FILE-BY-FILE.md) — all backend code explained |
| 50–80 min | [02-FRONTEND-FILE-BY-FILE.md](./02-FRONTEND-FILE-BY-FILE.md) — all frontend code explained |
| 80–100 min | [04-API-DATA-AND-REVIEW.md](./04-API-DATA-AND-REVIEW.md) — JSON examples, errors, Q&A, demo script |
| 100–120 min | Practice demo + speak [04](./04-API-DATA-AND-REVIEW.md) § verbal script aloud |

## Document map

| File | Contents |
|------|----------|
| [01-BACKEND-FILE-BY-FILE.md](./01-BACKEND-FILE-BY-FILE.md) | `server.js`, models, middleware, routes, controllers, utils, seed data |
| [02-FRONTEND-FILE-BY-FILE.md](./02-FRONTEND-FILE-BY-FILE.md) | `main.jsx`, App, store, context, api, every page & component, CSS, Vite |
| [03-INTEGRATIONS-AND-FLOWS.md](./03-INTEGRATIONS-AND-FLOWS.md) | Every npm package + browser API; labeled end-to-end flows; diagrams |
| [04-API-DATA-AND-REVIEW.md](./04-API-DATA-AND-REVIEW.md) | All endpoints, bodies, responses, status codes, localStorage keys, review Q&A |
| [05-LINE-BY-LINE-CHECKOUT-AND-PAYMENT.md](./05-LINE-BY-LINE-CHECKOUT-AND-PAYMENT.md) | Checkout + payment walkthrough + full annotated code |

**Every doc ends with a `## Code —` section:** real snippets from the repo + what each part does (nothing removed from earlier text).

## Quick file locator (all 47 source files)

### Backend (18 files)

| File | Doc section |
|------|-------------|
| `backend/server.js` | [01 § server](./01-BACKEND-FILE-BY-FILE.md#serverjs) |
| `backend/models/User.js` | [01 § User](./01-BACKEND-FILE-BY-FILE.md#modelsuserjs) |
| `backend/models/Pizza.js` | [01 § Pizza](./01-BACKEND-FILE-BY-FILE.md#modelspizzajs) |
| `backend/models/Order.js` | [01 § Order](./01-BACKEND-FILE-BY-FILE.md#modelsorderjs) |
| `backend/middleware/auth.js` | [01 § auth middleware](./01-BACKEND-FILE-BY-FILE.md#middlewareauthjs) |
| `backend/middleware/errorHandler.js` | [01 § errorHandler](./01-BACKEND-FILE-BY-FILE.md#middlewareerrorhandlerjs) |
| `backend/middleware/requestLogger.js` | [01 § requestLogger](./01-BACKEND-FILE-BY-FILE.md#middlerequestloggerjs) |
| `backend/routes/authRoutes.js` | [01 § authRoutes](./01-BACKEND-FILE-BY-FILE.md#routesauthroutesjs) |
| `backend/routes/pizzaRoutes.js` | [01 § pizzaRoutes](./01-BACKEND-FILE-BY-FILE.md#routespizzaroutesjs) |
| `backend/routes/orderRoutes.js` | [01 § orderRoutes](./01-BACKEND-FILE-BY-FILE.md#routesorderroutesjs) |
| `backend/routes/paymentRoutes.js` | [01 § paymentRoutes](./01-BACKEND-FILE-BY-FILE.md#routespaymentroutesjs) |
| `backend/controllers/authController.js` | [01 § authController](./01-BACKEND-FILE-BY-FILE.md#controllersauthcontrollerjs) |
| `backend/controllers/pizzaController.js` | [01 § pizzaController](./01-BACKEND-FILE-BY-FILE.md#controllerspizzacontrollerjs) |
| `backend/controllers/orderController.js` | [01 § orderController](./01-BACKEND-FILE-BY-FILE.md#controllersordercontrollerjs) |
| `backend/controllers/paymentController.js` | [01 § paymentController](./01-BACKEND-FILE-BY-FILE.md#controllerspaymentcontrollerjs) |
| `backend/utils/orderItems.js` | [01 § orderItems](./01-BACKEND-FILE-BY-FILE.md#utilsorderitemsjs) |
| `backend/utils/importCatalog.js` | [01 § importCatalog](./01-BACKEND-FILE-BY-FILE.md#utilsimportcatalogjs) |

### Frontend (24 files)

| File | Doc section |
|------|-------------|
| `frontend/index.html` | [02 § index.html](./02-FRONTEND-FILE-BY-FILE.md#indexhtml) |
| `frontend/vite.config.js` | [02 § vite](./02-FRONTEND-FILE-BY-FILE.md#viteconfigjs) |
| `frontend/tailwind.config.js` | [02 § tailwind](./02-FRONTEND-FILE-BY-FILE.md#tailwindconfigjs) |
| `frontend/postcss.config.js` | [02 § postcss](./02-FRONTEND-FILE-BY-FILE.md#postcssconfigjs) |
| `frontend/src/index.css` | [02 § index.css](./02-FRONTEND-FILE-BY-FILE.md#srccss) |
| `frontend/src/main.jsx` | [02 § main](./02-FRONTEND-FILE-BY-FILE.md#mainjsx) |
| `frontend/src/App.jsx` | [02 § App](./02-FRONTEND-FILE-BY-FILE.md#appjsx) |
| `frontend/src/services/api.js` | [02 § api](./02-FRONTEND-FILE-BY-FILE.md#servicesapijs) |
| `frontend/src/store/store.js` | [02 § store](./02-FRONTEND-FILE-BY-FILE.md#storestorejs) |
| `frontend/src/store/authSlice.js` | [02 § authSlice](./02-FRONTEND-FILE-BY-FILE.md#storeauthslicejs) |
| `frontend/src/store/cartSlice.js` | [02 § cartSlice](./02-FRONTEND-FILE-BY-FILE.md#storecartslicejs) |
| `frontend/src/hooks/useAuth.js` | [02 § AuthContext](./02-FRONTEND-FILE-BY-FILE.md#contextauthcontextjsx) |
| `frontend/src/hooks/useCart.js` | [02 § CartContext](./02-FRONTEND-FILE-BY-FILE.md#contextcartcontextjsx) |
| `frontend/STRUCTURE.md` | Folder layout and where to add code |
| `frontend/src/utils/format.js` | [02 § format](./02-FRONTEND-FILE-BY-FILE.md#utilsformatjs) |
| `frontend/src/utils/razorpay.js` | [02 § razorpay](./02-FRONTEND-FILE-BY-FILE.md#utilsrazorpayjs) |
| `frontend/src/components/*` | [02 § components](./02-FRONTEND-FILE-BY-FILE.md#components) — `layout/`, `ui/`, `guards/` |
| `frontend/src/features/*/pages/*` (11 route pages) | Grouped by feature; see [STRUCTURE.md](../frontend/STRUCTURE.md) |

### Config / deploy (not application logic, but documented)

| File | Doc section |
|------|-------------|
| `backend/.env.example` | [04 § env](./04-API-DATA-AND-REVIEW.md#environment-variables) |
| `frontend/.env.example` | [04 § env](./04-API-DATA-AND-REVIEW.md#environment-variables) |
| `frontend/.env.production` | [04 § deploy](./04-API-DATA-AND-REVIEW.md#deployment) |
| `vercel.json` | [04 § deploy](./04-API-DATA-AND-REVIEW.md#deployment) |
| `backend/package.json` | [03 § dependencies](./03-INTEGRATIONS-AND-FLOWS.md#complete-dependency-list) |
| `frontend/package.json` | [03 § dependencies](./03-INTEGRATIONS-AND-FLOWS.md#complete-dependency-list) |

---

**Note:** `PROJECT_GUIDE.md` in the repo root is a shorter overview. **This `docs/` folder is the authoritative deep guide.**
