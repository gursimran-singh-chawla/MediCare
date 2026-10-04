# MediCare – How to Use & Test

This guide explains what the app does, what you'll see after logging in with each role, and a step-by-step checklist to test every feature. For installation, see **SETUP.md** first. For the zero-setup demo with mock data, see **MOCK.md** (`npm run mock`).

---

## 1. What is real and what is demo?

MediCare is a **fully working app**: every page talks to the Express API and stores data in MongoDB. Nothing is hard-coded in the UI except the items below.

| Area | Status |
| --- | --- |
| Login / signup / sessions | Real (passwords hashed with bcrypt, cookie sessions) |
| Doctor registration & admin approval | Real (files uploaded to `backend/uploads`) |
| Appointments, calendar, prescriptions, receipts | Real data from MongoDB |
| Ratings & reviews | Real (stored in MongoDB, averages calculated by the API) |
| Payments | Razorpay **test mode** (free test keys, no real money) – or **simulated** in mock mode / with `MOCK_PAYMENTS=true` |
| Video consultation | Each paid booking gets a free Jitsi Meet link (`meet.jit.si`) |
| Emails | Sent only if Gmail credentials are configured; otherwise skipped and logged in the terminal |
| Doctor photos | **Demo illustrations** (4 images in `frontend/public/doctors`) – the same doctor always gets the same image |
| Chatbot (bottom-right bubble) | Simple keyword-based replies, not AI |
| Donate page | Static information page (no payment processing) |
| Demo accounts / sample data | Loaded automatically by `npm run mock`, or saved to MongoDB with `npm run seed:demo` |

---

## 2. Demo accounts

Either start **mock mode** (no MongoDB needed – data is loaded automatically and the login page has one-click buttons for these accounts):

```bash
npm run mock
```

or, in full mode with MongoDB running, save the same data permanently once:

```bash
npm run seed:demo
```

| Role | Login tab | Email / username | Password |
| --- | --- | --- | --- |
| Admin | Patient **or** Doctor | `admin` | `admin` |
| Doctor | Doctor | `doctor@medicare.com` | `doctor123` |
| Patient | Patient | `patient@medicare.com` | `patient123` |

The seed also creates **5 more approved doctors** (Dermatology, Orthopedics, Neurology, General Physician, Dentistry – all with password `doctor123`), about **29 appointments** and **29 reviews**. Re-running it resets the demo data around today's date; it does not touch other accounts.

---

## 3. What each user sees

### Visitor (not logged in)
- **Home** – hero, how it works, featured doctors, testimonials, FAQ.
- **Find Doctors** (`/appointment`) – search, sort (recommended, top rated, fee, experience), filter by specialty, max fee, experience and available day. Each card shows the real star rating and review count (or **New** if none).
- **Doctor profile** (`/book/:id`) – details, fee, booking form and all **patient reviews** with a rating breakdown.
- Contact, Donate, About/Services/Privacy pages.
- Nothing doctor- or admin-related appears in the navbar.

### Patient
Everything a visitor sees, plus:
- **Book appointments** – pick a date (next 10 days), time slot, details → pay with Razorpay.
- **My Bookings** – tabs for All / Confirmed / Awaiting payment / With prescription. Paid bookings have buttons for the meeting link, receipt and **⭐ Rate this doctor**.
- **Booking details** – status, meeting link, and the doctor's prescription once written.
- **Receipt** – printable receipt for paid bookings.
- **Reviews** – can post, edit and delete **one review per doctor**, only after a **paid** appointment with that doctor.

### Doctor
- Opens on the **doctor dashboard** with stats (total, confirmed, paid, pending, failed, revenue).
- **Calendar** tab – Google Calendar–style schedule:
  - Day / Week / Month views, mini month calendar, colour legend, "Up next today".
  - Click any appointment for patient details, **Join meeting** and **Add/Edit prescription**.
  - Shortcuts: `←` `→` move, `T` today, `D` / `W` / `M` change view, `Esc` close details.
- **All appointments** tab – searchable table with payment filter.
- **Reviews** tab – read-only view of what patients wrote.
- **Profile** tab – own details and verification documents.
- **Prescription form** – diagnosis, notes and medicines (dosage, frequency, duration).

### Admin
- **Dashboard** – counts of doctors (pending / approved / rejected), patients and appointments.
- **Pending doctors** – view uploaded photo, ID and certificates → **Approve** or **Reject** with a reason.
- **Approved / Rejected doctors** lists, and each doctor's appointments.

---

## 4. Test checklist

Work through these in order. Tip: use a normal window for one role and an **incognito window** for another, so you can be logged in as two users at once.

### A. Browsing (no login)
1. Open http://localhost:5174 and scroll the home page.
2. Go to **Find Doctors**. Try the search box, the specialty list, the fee slider, experience and day filters, and **Sort → Top rated**.
3. Open a doctor. Scroll to **Patient reviews** – see the average, the 5→1 star bars and the review list. You'll see "Log in as a patient to rate this doctor".

### B. Patient + reviews (no Razorpay needed)
1. Log in on the **Patient** tab with `patient@medicare.com` / `patient123`.
2. Open **My Bookings** – you'll see past and upcoming appointments.
3. Click the **⭐** button on the paid booking with **Dr. Arjun Verma** → you land on his reviews.
4. Pick stars (hover to preview), write a comment, **Post review**. The average and bars update instantly.
5. **Edit** and **Delete** your review.
6. Open **Dr. Neha Kulkarni** – your existing review is shown as "Your review".
7. Open **Dr. Priya Menon** – you can't review her (no paid visit), so a note explains why.
8. Log out and open Dr. Arjun Verma again – your review is visible to everyone.

### C. Doctor
1. Log in on the **Doctor** tab with `doctor@medicare.com` / `doctor123`.
2. **Calendar**: switch Day / Week / Month, use the arrows and **Today**, click dates in the mini calendar.
3. Click an appointment → **Add prescription** → add a medicine → save.
4. Log back in as the patient → **My Bookings** → that booking shows a **Prescription** badge; open **Details** to read it.
5. Doctor **Reviews** tab shows the patient reviews.

### D. Doctor registration + admin approval
1. Log out. `/login` → **Doctor** tab → **Apply as a doctor**. Fill the form and upload any image/PDF for photo and ID.
2. Try logging in as that doctor → "awaiting admin approval".
3. Log in as **admin / admin** → **Pending doctors** → open the files → **Approve** (or **Reject** with a reason).
4. Log in as the new doctor → dashboard opens. The doctor now appears on **Find Doctors** with a **New** badge.

### E. New patient + payment
1. **Sign up** a new patient and log in.
2. Find a doctor → choose date, time, fill details → **Continue to payment**.
3. Pay:
   - **Mock mode / `MOCK_PAYMENTS=true`:** click **Pay ₹X (mock)**. Try **Simulate a failed payment** on another booking to see the failed state.
   - **Razorpay test keys:** in the popup use card `4111 1111 1111 1111`, any future expiry, any CVV, any OTP – or UPI `success@razorpay`.
4. You land on **Payment success** with the meeting link. The booking is in **My Bookings** with a receipt.
5. That patient can now rate the doctor. Log in as the doctor – the appointment appears on the calendar.

In full mode without Razorpay keys and without `MOCK_PAYMENTS=true`, step 2 shows "Razorpay credentials are missing".

### F. Security checks
- Visit `/doctor/dashboard` or `/admin/dashboard` as a patient → redirected away.
- Wrong password → the form shakes and shows an error.
- Reviews can't be posted without logging in, or without a paid visit (the API returns 401/403).

---

## 5. API quick reference

All endpoints are under `http://localhost:4000/api`.

| Method | Endpoint | Who | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/signup` | Public | Create patient account |
| POST | `/auth/login` | Public | Login (patient / doctor / admin) |
| POST | `/auth/logout` | Any | Logout |
| GET | `/session` | Any | Current session |
| GET | `/doctors` | Public | Approved doctors with `rating { average, count }` |
| GET | `/doctors/:id` | Public | One doctor |
| GET | `/doctors/:id/reviews` | Public | Summary, distribution, reviews (+ `myReview`, `canReview` for patients) |
| POST | `/doctors/:id/reviews` | Patient with paid visit | Create or update own review `{ rating: 1-5, comment }` |
| DELETE | `/doctors/:id/reviews` | Patient | Delete own review |
| POST | `/appointments` | Public | Create appointment + Razorpay order |
| POST | `/payments/verify` | Public | Verify Razorpay payment |
| GET | `/patient/bookings` | Patient | Own bookings |
| POST | `/doctor/register` | Public | Doctor application (multipart) |
| GET | `/doctor/dashboard` | Doctor | Stats + appointments |
| GET | `/admin/dashboard` | Admin | Admin stats |

---

## 6. Resetting data

- Mock mode: just stop and restart `npm run mock` – you get a fresh mock dataset.
- Reset demo data (full mode): `npm run seed:demo`
- Wipe everything (MongoDB shell): `mongosh medicare --eval "db.dropDatabase()"`, then run the seed again.
