import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock3, Home, LayoutDashboard, LogOut, Menu, X, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const navByRole = {
  admin: [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/doctors/pending', label: 'Pending doctors', icon: Clock3 },
    { to: '/admin/doctors/approved', label: 'Approved doctors', icon: CheckCircle2 },
    { to: '/admin/doctors/rejected', label: 'Rejected doctors', icon: XCircle }
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard }
  ]
};

export default function WorkspaceLayout({ role, title, subtitle, actions, children }) {
  const { session, logout } = useApp();
  const [open, setOpen] = useState(false);
  const name = role === 'admin' ? 'Administrator' : `Dr. ${session.doctor?.name || ''}`;

  const sidebar = (
    <>
      <Link to="/" className="site-brand ws-brand"><span className="site-brand-mark">M</span>MediCare</Link>
      <span className="ws-role">{role === 'admin' ? 'Admin console' : 'Doctor workspace'}</span>
      <nav className="ws-nav">
        {navByRole[role].map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)}>
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId={`ws-active-${open}`} className="ws-active" transition={{ type: 'spring', stiffness: 480, damping: 36 }} />}
                <Icon size={18} /> <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <NavLink to="/" end><Home size={18} /> <span>Back to site</span></NavLink>
      </nav>
      <div className="ws-user">
        <span className="avatar-sm">{role === 'admin' ? 'A' : (session.doctor?.name || 'D')[0]}</span>
        <div><strong>{name}</strong><small>{role === 'admin' ? 'Full access' : session.doctor?.specialization}</small></div>
        <button type="button" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={17} /></button>
      </div>
    </>
  );

  return (
    <div className="ws-shell">
      <aside className="ws-sidebar">{sidebar}</aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="ws-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="ws-sidebar ws-drawer" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="ws-main">
        <header className="ws-header">
          <button type="button" className="ws-burger" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="ws-title">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="ws-actions">{actions}</div>}
        </header>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
