# ⚓ Harbor — Personal Finance Tracker

> **Your finances, anchored.**

Harbor is a full-stack personal finance web application built with the MERN stack. Track income and expenses, set budgets, manage savings goals, and get smart analytics — all in a beautifully designed, theme-aware interface.

---

## ✨ Features

- 🔐 **Secure Auth** — JWT-based registration & login with bcrypt password hashing
- 📊 **Dashboard** — Live balance, income vs expense charts, spending breakdown
- 💸 **Transactions** — Add, edit, delete income and expense records by category
- 🎯 **Budget Planner** — Set monthly category limits with visual progress tracking
- 🏆 **Savings Goals** — Create and track financial goals with deadlines
- 📈 **Analytics** — Monthly trends, category breakdowns, AI-style spending insights
- ⚙️ **Settings** — Dark/Light mode, 3 accent themes (Blue, Crimson, Forest Green), multi-currency support
- 🎨 **Dynamic Theming** — Navy sidebar fixed in both modes; accent colors update buttons, charts, and highlights
- 📱 **Responsive** — Works on desktop and mobile with a collapsible sidebar

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS v4, CSS Custom Properties |
| **Charts** | Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas via Mongoose |
| **Auth** | JSON Web Tokens (JWT) + bcrypt |
| **Security** | Helmet, CORS whitelist, Rate limiting |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/parthBhutada13/Harbor.git
cd Harbor
```

### 2. Set up the backend
```bash
cd backend
cp .env.example .env
# Fill in your MONGO_URI and JWT_SECRET in .env
npm install
node server.js
# Backend runs on http://localhost:5000
```

### 3. Set up the frontend
```bash
# From the project root
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/harbor_finance
JWT_SECRET=your_64_character_random_hex_here
PORT=5000
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5173
```

> ⚠️ **Never commit `.env` to version control.** It's already protected by `.gitignore`.

---

## 📁 Project Structure

```
harbor/
├── backend/                 # Express API server
│   ├── controllers/         # Route handler logic
│   ├── middleware/          # JWT auth middleware
│   ├── models/              # Mongoose schemas (User, Transaction, Budget, Goal)
│   ├── routes/              # API route definitions
│   ├── server.js            # Entry point with security middleware
│   └── .env.example         # Environment variable template
│
├── src/                     # React frontend
│   ├── app/
│   │   ├── components/      # Layout, sidebar, shared UI
│   │   ├── context/         # FinanceContext — global state & API layer
│   │   └── pages/           # Dashboard, Transactions, Budget, Goals, Analytics, Settings
│   └── styles/              # Global CSS & design tokens
│
├── index.html
├── vite.config.ts
└── .gitignore
```

---

## 🔒 Security Highlights

- Passwords hashed with **bcrypt** (salt rounds: 12)
- All data routes protected by **JWT middleware**
- **Helmet.js** sets production-grade HTTP security headers
- **CORS** restricted to whitelisted origins only
- **Rate limiting**: 20 req/15min on auth, 300 req/15min on API
- Request body capped at **10KB** to prevent payload attacks
- Stack traces **never exposed** in production responses
- Full page reload on logout — **zero data leakage** between user sessions

---

## 📸 Screenshots

> Dashboard · Transactions · Analytics · Settings

---

## 🌐 Deployment

| Service | Purpose |
|---------|---------|
| [Vercel](https://vercel.com) | Frontend (React + Vite) |
| [Render](https://render.com) | Backend (Express API) |
| [MongoDB Atlas](https://mongodb.com/atlas) | Database |

---

## 📄 License

MIT — feel free to fork, modify, and use for your own projects.

---

<p align="center">Built with ❤️ by <a href="https://github.com/parthBhutada13">Parth Bhutada</a></p>