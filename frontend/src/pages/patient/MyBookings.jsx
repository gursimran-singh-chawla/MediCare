import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, CalendarPlus, ChevronRight, Clock3, FileText, Receipt, Star, Video } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout.jsx';
import Badge from '../../components/Badge.jsx';
import Loader from '../../components/Loader.jsx';
import { api } from '../../api/client.js';
import { useApp } from '../../context/AppContext.jsx';

const tabs = [
  ['all', 'All'],
  ['confirmed', 'Confirmed'],
  ['pending', 'Awaiting payment'],
  ['prescriptions', 'With prescription']
];

export default function MyBookings() {
  const { session, setAlert } = useApp();
  const [appointments, setAppointments] = useState(null);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    api('/api/patient/bookings')
      .then((data) => setAppointments(data.appointments))
      .catch((error) => { setAppointments([]); setAlert({ type: 'error', message: error.message }); });
  }, [setAlert]);

  const filtered = useMemo(() => (appointments || []).filter((appointment) => {
    if (tab === 'confirmed') return appointment.appointmentStatus === 'confirmed';
    if (tab === 'pending') return appointment.paymentStatus !== 'paid';
    if (tab === 'prescriptions') return Boolean(appointment.prescription?.updatedAt);
    return true;
  }), [appointments, tab]);

  return (
    <PublicLayout>
      <section className="page-hero compact">
        <div className="page-container hero-row">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="eyebrow">My bookings</span>
            <h1>Hi {session?.user?.name?.split(' ')[0] || 'there'}, here’s your care.</h1>
            <p>Appointments, meeting links, receipts and prescriptions — all in one place.</p>
          </motion.div>
          <Link className="btn btn-primary btn-lg" to="/appointment"><CalendarPlus size={18} /> New appointment</Link>
        </div>
      </section>

      <section className="page-container">
        <div className="tab-bar">
          {tabs.map(([value, label]) => (
            <button key={value} type="button" className={`tab ${tab === value ? 'active' : ''}`} onClick={() => setTab(value)}>
              {tab === value && <motion.span layoutId="booking-tab" className="tab-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
              <span>{label}</span>
            </button>
          ))}
        </div>

        {!appointments ? <Loader label="Loading your bookings" /> : filtered.length === 0 ? (
          <motion.div className="empty-modern" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="empty-icon"><CalendarDays size={28} /></span>
            <h3>No bookings here yet</h3>
            <p>When you book an appointment it will show up here.</p>
            <Link className="btn btn-primary" to="/appointment">Find a doctor</Link>
          </motion.div>
        ) : (
          <motion.div layout className="booking-list">
            <AnimatePresence mode="popLayout">
              {filtered.map((appointment, index) => (
                <motion.article
                  key={appointment._id}
                  layout
                  className="booking-card"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                >
                  <div className="booking-date">
                    <strong>{new Date(appointment.date).getDate() || '–'}</strong>
                    <small>{new Date(appointment.date).toLocaleDateString(undefined, { month: 'short' })}</small>
                  </div>
                  <div className="booking-main">
                    <h3>Dr. {appointment.doctorName}</h3>
                    <p>{appointment.doctorSpecialization || 'Consultation'}</p>
                    <div className="booking-meta">
                      <span><Clock3 size={14} /> {appointment.time}</span>
                      <Badge value={appointment.appointmentStatus} />
                      <Badge value={appointment.paymentStatus} />
                      {appointment.prescription?.updatedAt && <span className="badge badge-rx"><FileText size={12} /> Prescription</span>}
                    </div>
                  </div>
                  <div className="booking-actions">
                    {appointment.meetingLink && <a className="icon-btn" href={appointment.meetingLink} target="_blank" rel="noreferrer" title="Join meeting"><Video size={17} /></a>}
                    {appointment.paymentStatus === 'paid' && <Link className="icon-btn" to={`/receipt/${appointment._id}`} title="Receipt"><Receipt size={17} /></Link>}
                    {appointment.paymentStatus === 'paid' && appointment.doctor && <Link className="icon-btn rate-btn" to={`/book/${appointment.doctor}#reviews`} title="Rate this doctor"><Star size={17} /></Link>}
                    <Link className="btn btn-ghost-modern btn-sm-modern" to={`/my-bookings/${appointment._id}`}>Details <ChevronRight size={15} /></Link>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </PublicLayout>
  );
}
