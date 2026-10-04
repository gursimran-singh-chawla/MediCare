import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Receipt as ReceiptIcon, Video } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { api } from '../../api/client.js';
import { useApp } from '../../context/AppContext.jsx';

function AnimatedCheck() {
  return (
    <svg className="success-check" viewBox="0 0 52 52">
      <motion.circle cx="26" cy="26" r="24" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
      <motion.path fill="none" d="M15 27 l7 7 l15 -15" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5 }} />
    </svg>
  );
}

export default function PaymentSuccess() {
  const { id } = useParams();
  const { setAlert } = useApp();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    api(`/api/payments/success/${id}`).then((data) => setAppointment(data.appointment)).catch((error) => setAlert({ type: 'error', message: error.message }));
  }, [id, setAlert]);

  return (
    <PublicLayout>
      <section className="center-section">
        <motion.div className="card-modern success-card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <AnimatedCheck />
          <h1>You’re all set!</h1>
          <p>Your appointment is confirmed and a confirmation email is on its way.</p>
          {!appointment ? <Loader label="Loading details" /> : (
            <motion.div className="summary-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <div><span>Doctor</span><strong>Dr. {appointment.doctorName}</strong></div>
              <div><span>When</span><strong>{appointment.date} · {appointment.time}</strong></div>
              <div><span>Receipt</span><strong>{appointment.receiptNumber || 'N/A'}</strong></div>
              <div><span>Payment ID</span><strong className="mono">{appointment.paymentId}</strong></div>
            </motion.div>
          )}
          <div className="actions-center">
            {appointment?.meetingLink && <a className="btn btn-primary" href={appointment.meetingLink} target="_blank" rel="noreferrer"><Video size={17} /> Meeting link</a>}
            {appointment && <Link className="btn btn-ghost-modern" to={`/receipt/${appointment._id}`}><ReceiptIcon size={17} /> View receipt</Link>}
            <Link className="btn btn-ghost-modern" to="/">Home</Link>
          </div>
        </motion.div>
      </section>
    </PublicLayout>
  );
}
