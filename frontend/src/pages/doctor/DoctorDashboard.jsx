import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarCheck2, CalendarDays, CheckCircle2, Clock3, IndianRupee, List, Search, Star, UserRound, Users, XCircle } from 'lucide-react';
import WorkspaceLayout from '../../components/WorkspaceLayout.jsx';
import AppointmentsTable from '../../components/AppointmentsTable.jsx';
import DoctorCalendar from '../../components/DoctorCalendar.jsx';
import DoctorReviews from '../../components/DoctorReviews.jsx';
import Loader from '../../components/Loader.jsx';
import { CountUp } from '../../components/motion.jsx';
import { api, assetUrl } from '../../api/client.js';
import { doctorImage } from '../../utils/doctorImage.js';
import { useApp } from '../../context/AppContext.jsx';
import { formatDateTime } from '../../utils/format.js';

const tabs = [
  ['calendar', 'Calendar', CalendarDays],
  ['list', 'All appointments', List],
  ['reviews', 'Reviews', Star],
  ['profile', 'Profile', UserRound]
];

export default function DoctorDashboard() {
  const { setAlert } = useApp();
  const [data, setData] = useState(null);
  const [query, setQuery] = useState('');
  const [payment, setPayment] = useState('');
  const [tab, setTab] = useState('calendar');

  useEffect(() => {
    api('/api/doctor/dashboard').then(setData).catch((error) => setAlert({ type: 'error', message: error.message }));
  }, [setAlert]);

  if (!data) return <WorkspaceLayout role="doctor" title="Dashboard"><Loader label="Loading your dashboard" /></WorkspaceLayout>;

  const { doctor, appointments, stats } = data;
  const filtered = appointments.filter((appointment) => {
    const text = `${appointment.patientName} ${appointment.patientEmail} ${appointment.patientPhone} ${appointment.paymentId}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (!payment || appointment.paymentStatus === payment);
  });

  const cards = [
    { label: 'Total appointments', value: stats.totalAppointments, icon: Users, tone: 'teal' },
    { label: 'Confirmed', value: stats.confirmedAppointments, icon: CalendarCheck2, tone: 'blue' },
    { label: 'Paid', value: stats.paidAppointments, icon: CheckCircle2, tone: 'green' },
    { label: 'Pending payment', value: stats.pendingPayments, icon: Clock3, tone: 'amber' },
    { label: 'Failed payment', value: stats.failedPayments, icon: XCircle, tone: 'red' },
    { label: 'Total revenue', value: stats.totalRevenue, icon: IndianRupee, tone: 'violet', prefix: '₹' }
  ];

  return (
    <WorkspaceLayout role="doctor" title={`Good to see you, Dr. ${doctor.name.split(' ')[0]}`} subtitle={`${doctor.degree} · ${doctor.specialization}`}>
      <div className="kpi-grid">
        {cards.map(({ label, value, icon: Icon, tone, prefix }, index) => (
          <motion.div key={label} className={`kpi kpi-${tone}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <span className="kpi-icon"><Icon size={18} /></span>
            <small>{label}</small>
            <strong>{prefix}<CountUp to={Number(value) || 0} /></strong>
          </motion.div>
        ))}
      </div>

      <div className="dash-tabs" role="tablist">
        {tabs.map(([value, label, Icon]) => (
          <button key={value} type="button" role="tab" aria-selected={tab === value} className={tab === value ? 'active' : ''} onClick={() => setTab(value)}>
            {tab === value && <motion.span layoutId="dash-tab-pill" className="dash-tab-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span><Icon size={16} /> {label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {tab === 'calendar' && <DoctorCalendar appointments={appointments} />}

          {tab === 'reviews' && <DoctorReviews doctorId={doctor._id} readOnly />}

          {tab === 'list' && (
            <section className="card-modern table-card">
              <div className="table-toolbar">
                <h3>Appointments</h3>
                <div className="toolbar-controls">
                  <div className="input-icon"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search patients" /></div>
                  <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                    <option value="">All payments</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              <AppointmentsTable appointments={filtered} doctorMode />
            </section>
          )}

          {tab === 'profile' && (
        <aside className="card-modern profile-card profile-wide">
          <img className="profile-avatar" src={doctorImage(doctor)} alt={doctor.name} />
          <h3>Dr. {doctor.name}</h3>
          <span className="badge badge-confirmed">{doctor.status}</span>
          <dl className="profile-dl">
            <div><dt>Email</dt><dd>{doctor.email}</dd></div>
            <div><dt>Phone</dt><dd>{doctor.phone}</dd></div>
            <div><dt>Fee</dt><dd>₹{doctor.price} / min</dd></div>
            <div><dt>Experience</dt><dd>{doctor.experience} years</dd></div>
            <div><dt>Approved</dt><dd>{formatDateTime(doctor.approvedAt)}</dd></div>
            <div><dt>Licence</dt><dd>{doctor.medicalLicense}</dd></div>
            <div><dt>Available</dt><dd>{doctor.availableDays?.length ? doctor.availableDays.join(', ') : 'Not set'}</dd></div>
            <div><dt>Address</dt><dd>{doctor.address}</dd></div>
          </dl>
          <div className="doc-links">
            {doctor.document && <a className="btn btn-ghost-modern btn-sm-modern" href={assetUrl(doctor.document)} target="_blank" rel="noreferrer">Verification document</a>}
            {doctor.certificates?.map((file, index) => <a className="btn btn-ghost-modern btn-sm-modern" href={assetUrl(file)} target="_blank" rel="noreferrer" key={file}>Certificate {index + 1}</a>)}
          </div>
        </aside>
          )}
        </motion.div>
      </AnimatePresence>
    </WorkspaceLayout>
  );
}
