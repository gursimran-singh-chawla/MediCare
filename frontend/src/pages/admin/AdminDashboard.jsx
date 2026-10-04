import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarCheck2, CheckCircle2, Clock3, Stethoscope, Users, XCircle } from 'lucide-react';
import WorkspaceLayout from '../../components/WorkspaceLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { CountUp } from '../../components/motion.jsx';
import { api } from '../../api/client.js';
import { useApp } from '../../context/AppContext.jsx';

export default function AdminDashboard() {
  const { setAlert } = useApp();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api('/api/admin/dashboard').then((data) => setStats(data.stats)).catch((error) => setAlert({ type: 'error', message: error.message }));
  }, [setAlert]);

  const cards = stats ? [
    { label: 'Total doctors', value: stats.totalDoctors, icon: Stethoscope, tone: 'teal' },
    { label: 'Pending approvals', value: stats.pendingDoctors, icon: Clock3, tone: 'amber', to: '/admin/doctors/pending' },
    { label: 'Approved doctors', value: stats.approvedDoctors, icon: CheckCircle2, tone: 'green', to: '/admin/doctors/approved' },
    { label: 'Rejected doctors', value: stats.rejectedDoctors, icon: XCircle, tone: 'red', to: '/admin/doctors/rejected' },
    { label: 'Total patients', value: stats.totalPatients, icon: Users, tone: 'blue' },
    { label: 'Total appointments', value: stats.totalAppointments, icon: CalendarCheck2, tone: 'violet' }
  ] : [];

  return (
    <WorkspaceLayout role="admin" title="Overview" subtitle="Verification queue and platform activity at a glance.">
      {!stats ? <Loader label="Loading overview" /> : (
        <>
          <div className="kpi-grid three">
            {cards.map(({ label, value, icon: Icon, tone, to }, index) => {
              const body = (
                <>
                  <span className="kpi-icon"><Icon size={18} /></span>
                  <small>{label}</small>
                  <strong><CountUp to={Number(value) || 0} /></strong>
                  {to && <span className="kpi-link">View <ArrowRight size={14} /></span>}
                </>
              );
              return (
                <motion.div key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  {to ? <Link className={`kpi kpi-${tone} kpi-clickable`} to={to}>{body}</Link> : <div className={`kpi kpi-${tone}`}>{body}</div>}
                </motion.div>
              );
            })}
          </div>
          {stats.pendingDoctors > 0 && (
            <motion.div className="card-modern callout" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <span className="kpi-icon kpi-amber"><Clock3 size={18} /></span>
              <div>
                <strong>{stats.pendingDoctors} doctor{stats.pendingDoctors === 1 ? '' : 's'} waiting for review</strong>
                <p>Review their documents to let them start accepting appointments.</p>
              </div>
              <Link className="btn btn-primary" to="/admin/doctors/pending">Review now <ArrowRight size={16} /></Link>
            </motion.div>
          )}
        </>
      )}
    </WorkspaceLayout>
  );
}
