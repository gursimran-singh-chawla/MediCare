import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';

import Toaster from './components/Toaster.jsx';
import MockBadge from './components/MockBadge.jsx';
import RequireRole from './components/RequireRole.jsx';
import Home from './pages/Home.jsx';
import InfoPage from './pages/InfoPage.jsx';
import Donate from './pages/Donate.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import Doctors from './pages/patient/Doctors.jsx';
import BookDoctor from './pages/patient/BookDoctor.jsx';
import Payment from './pages/patient/Payment.jsx';
import PaymentSuccess from './pages/patient/PaymentSuccess.jsx';
import MyBookings from './pages/patient/MyBookings.jsx';
import BookingDetails from './pages/patient/BookingDetails.jsx';
import Receipt from './pages/patient/Receipt.jsx';
import Loader from './components/Loader.jsx';
import NotFound from './pages/NotFound.jsx';

const DoctorRegister = lazy(() => import('./pages/doctor/DoctorRegister.jsx'));
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard.jsx'));
const PrescriptionForm = lazy(() => import('./pages/doctor/PrescriptionForm.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminDoctors = lazy(() => import('./pages/admin/AdminDoctors.jsx'));
const AdminDoctorAppointments = lazy(() => import('./pages/admin/AdminDoctorAppointments.jsx'));
const RejectDoctor = lazy(() => import('./pages/admin/RejectDoctor.jsx'));

function Page({ children }) {
  return (
    <motion.div
      className="page-transition"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <Suspense fallback={<Loader fullscreen />}>{children}</Suspense>
    </motion.div>
  );
}

const patient = (element) => <RequireRole role="patient">{element}</RequireRole>;
const doctor = (element) => <RequireRole role="doctor">{element}</RequireRole>;
const admin = (element) => <RequireRole role="admin">{element}</RequireRole>;

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <Toaster />
      <MockBadge />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/about" element={<Page><InfoPage type="about" /></Page>} />
          <Route path="/services" element={<Page><InfoPage type="services" /></Page>} />
          <Route path="/donate" element={<Page><Donate /></Page>} />
          <Route path="/contact" element={<Page><Contact /></Page>} />

          <Route path="/login" element={<Page><Login /></Page>} />
          <Route path="/signup" element={<Page><Signup /></Page>} />
          <Route path="/doctor/login" element={<Navigate to="/login" replace state={{ role: 'doctor' }} />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/logindone" element={<Navigate to="/" replace />} />

          <Route path="/appointment" element={<Page><Doctors /></Page>} />
          <Route path="/book/:id" element={<Page><BookDoctor /></Page>} />
          <Route path="/payment" element={<Page><Payment /></Page>} />
          <Route path="/payment-success/:id" element={<Page><PaymentSuccess /></Page>} />
          <Route path="/receipt/:id" element={<Page><Receipt /></Page>} />
          <Route path="/my-bookings" element={<Page>{patient(<MyBookings />)}</Page>} />
          <Route path="/my-bookings/:id" element={<Page>{patient(<BookingDetails />)}</Page>} />

          <Route path="/doctor/register" element={<Page><DoctorRegister /></Page>} />
          <Route path="/doctor/dashboard" element={<Page>{doctor(<DoctorDashboard />)}</Page>} />
          <Route path="/doctor/appointments/:id/prescription" element={<Page>{doctor(<PrescriptionForm />)}</Page>} />

          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Page>{admin(<AdminDashboard />)}</Page>} />
          <Route path="/admin/doctors/:status" element={<Page>{admin(<AdminDoctors />)}</Page>} />
          <Route path="/admin/doctors/:id/appointments" element={<Page>{admin(<AdminDoctorAppointments />)}</Page>} />
          <Route path="/admin/reject/:id" element={<Page>{admin(<RejectDoctor />)}</Page>} />

          <Route path="*" element={<Page><NotFound /></Page>} />
        </Routes>
      </AnimatePresence>
    </MotionConfig>
  );
}
