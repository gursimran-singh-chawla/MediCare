import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarCheck2, ChevronDown, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/appointment', label: 'Find Doctors' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || 'U';
}

function UserMenu() {
  const { session, role, logout } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const name = role === 'admin' ? 'Admin' : role === 'doctor' ? `Dr. ${session.doctor.name}` : session.user.name;
  const email = role === 'admin' ? 'Administrator' : (session.user || session.doctor)?.email;

  useEffect(() => {
    const close = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const items = role === 'patient'
    ? [{ to: '/my-bookings', label: 'My bookings', icon: CalendarCheck2 }]
    : [{ to: role === 'admin' ? '/admin/dashboard' : '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard }];

  return (
    <div className="user-menu" ref={ref}>
      <button type="button" className="user-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="avatar-sm">{initials(name.replace('Dr. ', ''))}</span>
        <span className="user-name">{name.split(' ').slice(0, 2).join(' ')}</span>
        <ChevronDown size={16} className={`chev ${open ? 'open' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="user-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
          >
            <div className="user-dropdown-head">
              <strong>{name}</strong>
              <small>{email}</small>
            </div>
            {items.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}><Icon size={16} /> {label}</Link>
            ))}
            <button type="button" onClick={() => { setOpen(false); logout(); }}><LogOut size={16} /> Sign out</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const { role } = useApp();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <header className={`nav-modern ${scrolled ? 'scrolled' : ''}`}>
      <nav className="nav-inner">
        <Link to="/" className="site-brand" aria-label="MediCare home">
          <span className="site-brand-mark">M</span>
          <span>MediCare</span>
        </Link>

        <div className="nav-links">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-link">
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="nav-active" className="nav-active" transition={{ type: 'spring', stiffness: 480, damping: 36 }} />}
                  <span className="nav-link-text">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="nav-actions">
          {role ? (
            <UserMenu />
          ) : (
            <>
              <Link className="btn btn-ghost-modern" to="/login">Sign in</Link>
              <Link className="btn btn-primary" to="/signup">Get started</Link>
            </>
          )}
          <button type="button" className="nav-burger" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="nav-mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {links.map(({ to, label, end }, index) => (
              <motion.div key={to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
                <NavLink to={to} end={end}>{label}</NavLink>
              </motion.div>
            ))}
            {!role && (
              <div className="nav-mobile-actions">
                <Link className="btn btn-ghost-modern" to="/login">Sign in</Link>
                <Link className="btn btn-primary" to="/signup">Get started</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
