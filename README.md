# Mini CRM — MERN Stack

A full-stack CRM application built with MongoDB, Express, React, and Node.js.

---

## 📁 Project Structure

```
mini-crm/
├── backend/       ← Express + MongoDB API
└── frontend/      ← React + MUI frontend
```

---

## ⚙️ Local Setup & Running

### Prerequisites
- Node.js v18+
- MongoDB (local) or a free [MongoDB Atlas](https://cloud.mongodb.com) cluster
- npm

---

### Step 1 — Set up the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mini-crm   # or your Atlas URI
JWT_SECRET=change_this_to_a_random_secret_string
JWT_EXPIRES_IN=7d
```

Install dependencies and start:
```bash
npm install
npm run dev       # uses nodemon for hot-reload
# or
npm start         # production mode
```

Backend runs on: **http://localhost:5000**

---

### Step 2 — Set up the Frontend

Open a new terminal:

```bash
cd frontend
cp .env.example .env
# Leave REACT_APP_API_URL blank for local dev (proxy handles it)
```

Install and start:
```bash
npm install
npm start
```

Frontend runs on: **http://localhost:3000**

> The frontend proxies `/api` requests to `http://localhost:5000` via `"proxy"` in `package.json`.

---

### Step 3 — Register and Use

1. Open http://localhost:3000
2. Click **Register** tab → create your first account
3. Log in and explore all modules

---

## 🔐 Authorization Logic

| Action | Who can do it |
|--------|--------------|
| Register / Login | Anyone |
| View / Create / Edit Leads | Any authenticated user |
| Soft Delete a Lead | Any authenticated user |
| View / Create Companies | Any authenticated user |
| Create Tasks | Any authenticated user |
| Update Task Status | **Only the assigned user** or **admin** |
| View Dashboard stats | Any authenticated user |

**How it works:**
- On login, the server returns a **JWT access token** (signed with `JWT_SECRET`)
- The frontend stores it in `localStorage` and sends it as `Authorization: Bearer <token>` on every request
- The `protect` middleware on the backend verifies the token and attaches `req.user`
- For task status updates, the route checks `task.assignedTo === req.user._id || req.user.role === 'admin'`

**Soft Delete:**
- Leads have an `isDeleted` field (default `false`)
- On delete, the API sets `isDeleted: true` and `deletedAt: Date`
- A Mongoose pre-hook (`pre(/^find/)`) automatically filters out deleted leads from all normal queries
- They do NOT appear in the leads list, dashboard counts, or company detail pages

---

## 🚀 Deployment Guide

### Backend → Render (Free Tier)

1. Push your code to GitHub (backend folder or full repo)
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/mini-crm
   JWT_SECRET=your_random_secret
   JWT_EXPIRES_IN=7d
   PORT=5000
   ```
6. Deploy → copy your backend URL (e.g., `https://mini-crm-api.onrender.com`)

---

### Frontend → Netlify

1. In `frontend/.env`, set:
   ```
   REACT_APP_API_URL=https://mini-crm-api.onrender.com/api
   ```
2. Build the app:
   ```bash
   cd frontend
   npm run build
   ```
3. Go to [netlify.com](https://netlify.com) → **Add new site** → **Deploy manually**
4. Drag and drop the `frontend/build/` folder
5. Done! Your site is live.

**OR deploy via Git:**
1. Push frontend to GitHub
2. New site from Git → choose repo
3. Set:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
4. Add environment variable: `REACT_APP_API_URL=https://your-backend.onrender.com/api`

> The `public/_redirects` file is already included so React Router works correctly on Netlify.

---

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/auth/users` | All users (for dropdowns) |
| GET | `/api/leads` | List leads (pagination, search, filter) |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update lead |
| PATCH | `/api/leads/:id/status` | Update status |
| DELETE | `/api/leads/:id` | Soft delete |
| GET | `/api/companies` | List companies |
| POST | `/api/companies` | Create company |
| GET | `/api/companies/:id` | Company detail + leads |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task (assigned user/admin) |
| PATCH | `/api/tasks/:id/status` | Update status (assigned user/admin) |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/dashboard/stats` | Dashboard aggregation |

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, MUI v5 |
| Data Fetching | TanStack Query (React Query) + Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (Access Token) + bcryptjs |
