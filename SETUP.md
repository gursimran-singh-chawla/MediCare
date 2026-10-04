# MediCare – Setup Guide

MediCare is an online doctor-consultation app with a **React (Vite)** frontend and a **Node.js (Express + MongoDB)** backend. Patients book and pay for appointments, doctors manage them from a calendar dashboard, patients rate and review doctors, and an admin verifies doctor accounts.

There are two ways to run it:

| Mode | Command | Needs MongoDB? | Needs Razorpay? | Data |
| --- | --- | --- | --- | --- |
| **Mock mode** (quickest) | `npm run mock` | No (in-memory) | No (simulated) | Mock data loaded automatically, resets on restart |
| **Full mode** | `npm run dev` | Yes | Optional | Saved permanently in MongoDB |

📄 Other guides: **MOCK.md** (mock mode in detail) · **USAGE.md** (what each role sees + test checklist)

---

## 1. Requirements

| Tool | Version | Needed for |
| --- | --- | --- |
| Node.js | 18 or newer (22 recommended) – https://nodejs.org | Both modes |
| Internet connection | – | First install (downloads packages and, for mock mode, a MongoDB binary ~100 MB) |
| MongoDB Community Server 6+ or MongoDB Atlas | https://www.mongodb.com/try/download/community | Full mode only |

```bash
node -v
npm -v
```

## 2. Install dependencies

From the project root (the folder with this file):

```bash
npm run install:all
```

This installs packages for the root, `backend/` and `frontend/`.

## 3. Quick start – mock mode ⚡

```bash
npm run mock
```

Wait for the **MOCK MODE** banner in the terminal (the first run takes a minute while the in-memory MongoDB is downloaded), then open **http://localhost:5174**.

| Role | Email / username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin` |
| Doctor | `doctor@medicare.com` | `doctor123` |
| Patient | `patient@medicare.com` | `patient123` |

On the login page a yellow **Mock mode** box offers one-click logins for all three. See **MOCK.md** for everything mock mode includes.

## 4. Full mode (real MongoDB)

### 4.1 Configure the backend

A ready-to-use `backend/.env` is included. If it is missing, copy the example:

```bash
# Windows (PowerShell)
Copy-Item backend/.env.example backend/.env
# macOS / Linux
cp backend/.env.example backend/.env
```

| Variable | What it is | Required? |
| --- | --- | --- |
| `PORT` | Backend port | Default `4000` |
| `CLIENT_URL` | Frontend URL allowed by CORS | Default `http://localhost:5174` |
| `SESSION_SECRET` | Long random string used to sign login cookies | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin login (default `admin` / `admin`) | Yes |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail address + App Password for notification emails | Optional |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay **test** keys | Optional |
| `MOCK_PAYMENTS` | `true` = simulate payments instead of Razorpay | Optional (default `false`) |

**MongoDB**
- **Local:** install MongoDB Community Server and keep `MONGODB_URI=mongodb://localhost:27017/medicare`. The database is created automatically.
- **Atlas (cloud):** create a free cluster, add a database user, allow your IP under *Network Access*, then use e.g. `MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/medicare`.

**Emails (optional)** – without them the app still works; emails are skipped and logged in the terminal.
1. Use a Gmail account with **2-Step Verification** on.
2. Google Account → Security → **App passwords** → create one.
3. Set `EMAIL_USER=yourname@gmail.com` and `EMAIL_PASS=<16-character app password>`.

**Payments** – pick one:
- **No setup:** set `MOCK_PAYMENTS=true` → checkout shows a simulated “Pay (mock)” button.
- **Razorpay test mode:** sign up at https://dashboard.razorpay.com → Test Mode → Settings → API Keys → *Generate Test Key*, then set `RAZORPAY_KEY_ID=rzp_test_...` and `RAZORPAY_KEY_SECRET=...`. Pay with card `4111 1111 1111 1111`, any future expiry, any CVV, or UPI `success@razorpay`.

### 4.2 Load demo data (recommended)

The database starts empty. With MongoDB running:

```bash
npm run seed:demo
```

This creates the same accounts as mock mode (table in section 3) – 6 approved doctors, a demo patient, ~29 appointments and ~29 reviews – saved permanently. Re-running it resets only the demo data around today's date.

### 4.3 Run

```bash
npm run dev
```

- Frontend: http://localhost:5174 (open this one)
- Backend API: http://localhost:4000

The frontend proxies `/api` and `/uploads` to the backend. Run separately with `npm run dev:backend` and `npm run dev:frontend` if you prefer.

## 5. Accounts without demo data

| Role | How |
| --- | --- |
| **Admin** | `/login` → username **`admin`**, password **`admin`** (either tab) |
| **Patient** | `/signup` → then log in from the *Patient* tab |
| **Doctor** | `/login` → *Doctor* tab → **Apply as a doctor**. The account stays *pending* until the admin approves it under **Pending doctors**, then log in from the *Doctor* tab. |

## 6. Project structure

```
medicare/
├── backend/                Express API (port 4000)
│   ├── config/               MongoDB connection (real or in-memory)
│   ├── controllers/          Route handlers (auth, appointments, payments, reviews, doctor, admin)
│   ├── middleware/           Auth guards, file uploads, error handler
│   ├── models/               Mongoose schemas (User, Doctor, Appointment, Review, Contact)
│   ├── routes/               API routes, mounted under /api
│   ├── scripts/seedDemoDoctor.js   Demo/mock data
│   ├── services/             Email (nodemailer) and Razorpay
│   ├── utils/                Helpers (ratings, meeting links, serializers)
│   ├── uploads/              Uploaded doctor photos/documents (starts empty)
│   ├── mock.js               Mock-mode entry point
│   ├── server.js             Normal entry point
│   └── .env                  Backend settings
├── frontend/               React app (port 5174)
│   ├── public/doctors/       Demo doctor illustrations
│   └── src/                  Pages, components, context, styles
├── SETUP.md · MOCK.md · USAGE.md
└── package.json            Root scripts (install:all, mock, dev, seed:demo, build, start)
```

## 7. Production build

```bash
npm run build      # builds the frontend into frontend/dist
npm start          # starts the backend
```

When the frontend is hosted separately, set `VITE_API_URL` in `frontend/.env` to the backend URL and `CLIENT_URL` in `backend/.env` to the frontend URL.

## 8. Troubleshooting

| Problem | Fix |
| --- | --- |
| Mock mode stuck on “starting in-memory MongoDB” | First run downloads MongoDB (~100 MB). Wait, and check your internet / antivirus. |
| `MongooseServerSelectionError` (full mode) | MongoDB isn't running or `MONGODB_URI` is wrong. On Windows start the *MongoDB* service; for Atlas check IP access. Or just use `npm run mock`. |
| `Port 5174 / 4000 is already in use` | Close the other app, or change `VITE_PORT` in `frontend/.env` / `PORT` in `backend/.env` (and `CLIENT_URL`). |
| `Razorpay credentials are missing` | Add Razorpay test keys, or set `MOCK_PAYMENTS=true`, then restart. |
| Logged out right after login | Open the app at `http://localhost:5174` (must match `CLIENT_URL`). |
| `.env` changes not applied | Stop the server (Ctrl + C) and start it again. |

## Tech stack

React 19, Vite 6, React Router 7, Framer Motion, Lucide icons · Node.js, Express 5, MongoDB + Mongoose, mongodb-memory-server (mock mode), express-session, Multer, Nodemailer, Razorpay.
