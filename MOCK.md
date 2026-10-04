# MediCare – Mock Mode

Mock mode runs the complete app **without installing MongoDB and without Razorpay keys**. It is the fastest way to see every screen with realistic data – ideal for demos, viva/presentations and testing.

## 1. Run it

```bash
npm run install:all   # once
npm run mock
```

Wait until the terminal shows:

```
==================== MOCK MODE ====================
 Mock data: 6 doctors, 29 appointments, 29 reviews
 Payments are simulated (no Razorpay keys needed).
 Data lives in memory and resets on every restart.

 Admin   : admin / admin
 Doctor  : doctor@medicare.com / doctor123
 Patient : patient@medicare.com / patient123

 Open http://localhost:5174
===================================================
```

Then open **http://localhost:5174**. Stop with **Ctrl + C**.

> First run only: the in-memory MongoDB binary (~100 MB) is downloaded, so it can take a minute or two. Later runs start in seconds.

## 2. Mock credentials

| Role | Login tab | Email / username | Password | Lands on |
| --- | --- | --- | --- | --- |
| Patient | Patient | `patient@medicare.com` | `patient123` | Home (My Bookings in the user menu) |
| Doctor | Doctor | `doctor@medicare.com` | `doctor123` | Doctor dashboard (calendar) |
| Admin | Either | `admin` | `admin` | Admin dashboard |

The 5 other mock doctors also log in with password `doctor123`:
`neha.kulkarni@medicare.com`, `sanjay.rao@medicare.com`, `priya.menon@medicare.com`, `rahul.bansal@medicare.com`, `kavya.reddy@medicare.com`.

**Shortcut:** on `/login` a yellow **“Mock mode – one-click demo logins”** box logs you in as Patient, Doctor or Admin with a single click. A **Mock mode** badge in the bottom-left corner of every page reminds you that you're on mock data.

## 3. Mock data you'll see

| Data | Details |
| --- | --- |
| Doctors | 6 approved doctors – Cardiology (Dr. Arjun Verma), Dermatology, Orthopedics, Neurology, General Physician, Dentistry – with fees, experience, available days and demo photos |
| Appointments | 25 for Dr. Arjun Verma spread from last week to two weeks ahead (paid, awaiting payment and failed/cancelled), so his **calendar** is full |
| Patient bookings | Riya Sharma (demo patient) has paid visits with Dr. Verma and Dr. Kulkarni, an upcoming paid visit with Dr. Rao and one awaiting payment |
| Reviews | ~29 star ratings + comments across all doctors; Riya already reviewed Dr. Kulkarni |
| Meeting links | Every paid booking has a Jitsi Meet link |

Dates are generated **relative to today**, so the calendar always looks current.

## 4. What behaves differently in mock mode

| Feature | Mock mode | Full mode |
| --- | --- | --- |
| Database | In-memory MongoDB, **wiped on every restart** (and re-filled with mock data) | Your MongoDB, permanent |
| Payments | Checkout shows **“Pay ₹X (mock)”** and **“Simulate a failed payment”** – no Razorpay popup, no money | Razorpay test checkout (or `MOCK_PAYMENTS=true`) |
| Emails | Never sent (logged as skipped) | Sent if Gmail is configured |
| Admin login | Always `admin` / `admin` | From `backend/.env` |
| Everything else (signup, doctor registration + file upload, approval, booking, prescriptions, receipts, calendar, reviews) | Works normally | Works normally |

Anything you create (new patients, doctors, bookings, reviews) works during the session but disappears when you stop `npm run mock`. Restarting gives you a clean mock dataset again. Code changes to the backend also restart it (and reset the data).

## 5. 5-minute mock tour

1. **Visitor:** open **Find Doctors** – filter by specialty, fee and day, sort by **Top rated**. Open **Dr. Arjun Verma** and scroll to the reviews.
2. **Patient** (one-click login): open **My Bookings** → click ⭐ on the paid Dr. Verma booking → rate and review him → edit/delete it.
3. **Book with mock payment:** Find Doctors → any doctor → pick date/time → **Continue to payment** → **Pay (mock)** → you get the success page, meeting link and receipt. Try **Simulate a failed payment** too.
4. **Doctor** (one-click login): see the booking you just made on the **Calendar** (Day/Week/Month), click it → **Add prescription**. Check the **Reviews** tab.
5. **Patient again:** the booking now has a **Prescription** badge in My Bookings.
6. **Admin** (one-click login): see the stats, then register a new doctor from `/doctor/register` (log out first) and approve it under **Pending doctors**.

For the full checklist see **USAGE.md**.

## 6. Mock payments in full mode (optional)

You can keep a real MongoDB but skip Razorpay by setting this in `backend/.env` and restarting:

```
MOCK_PAYMENTS=true
```

## 7. Troubleshooting

| Problem | Fix |
| --- | --- |
| Stuck on “starting in-memory MongoDB” | First-run download – wait. Check internet/antivirus/firewall. Corporate networks may block it; then use full mode with MongoDB Atlas. |
| `Mock mode could not start the in-memory database` | A download was probably interrupted. Delete the folder `backend/node_modules/.cache/mongodb-memory-server` (and `%USERPROFILE%\.cache\mongodb-binaries` on Windows / `~/.cache/mongodb-binaries` on macOS/Linux if it exists) and run again. |
| No mock-login box on `/login` | You're running `npm run dev` (full mode), not `npm run mock`. |
| My data disappeared | Expected – mock data resets on restart. Use full mode to keep data. |
