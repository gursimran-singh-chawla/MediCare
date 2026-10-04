import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { api } from '../../api/client.js';
import { useApp } from '../../context/AppContext.jsx';
import { formatDateTime } from '../../utils/format.js';

export default function Receipt() {
  const { id } = useParams();
  const { setAlert } = useApp();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    api(`/api/payments/receipt/${id}`).then((data) => setAppointment(data.appointment)).catch((error) => setAlert({ type: 'error', message: error.message }));
  }, [id, setAlert]);

  if (!appointment) return <PublicLayout><Loader label="Loading receipt" /></PublicLayout>;

  const rows = [
    ['Patient name', appointment.patientName],
    ['Patient email', appointment.patientEmail],
    ['Patient phone', appointment.patientPhone || 'N/A'],
    ['Doctor', `Dr. ${appointment.doctorName}`],
    ['Speciality', appointment.doctorSpecialization || '—'],
    ['Appointment', `${appointment.date} at ${appointment.time}`],
    ['Payment ID', appointment.paymentId || 'N/A'],
    ['Order ID', appointment.orderId || 'N/A'],
    ['Paid at', formatDateTime(appointment.paidAt)]
  ];

  return (
    <PublicLayout>
      <section className="page-container booking-page">
        <div className="split no-print">
          <Link className="back-link" to="/my-bookings"><ArrowLeft size={16} /> My bookings</Link>
          <button className="btn btn-primary" type="button" onClick={() => window.print()}><Printer size={17} /> Print / Save PDF</button>
        </div>
        <motion.div className="receipt-modern" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="receipt-head">
            <div>
              <span className="site-brand"><span className="site-brand-mark">M</span>MediCare</span>
              <p>Receipt <strong>#{appointment.receiptNumber || appointment._id}</strong></p>
            </div>
            <span className="badge badge-paid">PAID</span>
          </div>
          <dl className="receipt-rows">
            {rows.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
            {appointment.meetingLink && <div><dt>Meeting link</dt><dd><a href={appointment.meetingLink}>{appointment.meetingLink}</a></dd></div>}
          </dl>
          <div className="receipt-total"><span>Amount paid</span><strong>₹{appointment.amount || 0}</strong></div>
        </motion.div>
      </section>
    </PublicLayout>
  );
}
