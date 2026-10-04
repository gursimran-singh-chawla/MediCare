import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { AlertCircle, ArrowRight, FlaskConical, HeartPulse, Lock, Mail, Stethoscope } from 'lucide-react';
import AuthLayout from '../../components/AuthLayout.jsx';
import Field from '../../components/Field.jsx';
import { api } from '../../api/client.js';
import { useApp } from '../../context/AppContext.jsx';

const roles = [
  { id: 'patient', label: 'Patient', icon: HeartPulse },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope }
];

const mockAccounts = [
  { label: 'Patient', body: { email: 'patient@medicare.com', password: 'patient123', role: 'patient' } },
  { label: 'Doctor', body: { email: 'doctor@medicare.com', password: 'doctor123', role: 'doctor' } },
  { label: 'Admin', body: { email: 'admin', password: 'admin', role: 'patient' } }
];

const homeFor = { admin: '/admin/dashboard', doctor: '/doctor/dashboard', patient: '/' };

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { session, role: currentRole, sessionReady, applySession, setAlert } = useApp();

  const initialRole = location.state?.role || params.get('role');
  const [role, setRole] = useState(initialRole === 'doctor' ? 'doctor' : 'patient');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const shakeControls = useAnimationControls();

  useEffect(() => { setError(''); }, [role]);

  if (sessionReady && currentRole && !busy) {
    return <Navigate to={homeFor[currentRole]} replace />;
  }

  function submit(event) {
    event.preventDefault();
    signIn({ ...Object.fromEntries(new FormData(event.currentTarget).entries()), role });
  }

  async function signIn(body) {
    setBusy(true);
    setError('');
    try {
      const data = await api('/api/auth/login', { method: 'POST', body });
      applySession(data);
      setAlert({ type: 'success', message: data.message });
      const from = location.state?.from;
      const destination = data.role === 'patient' && from && !from.startsWith('/doctor') && !from.startsWith('/admin')
        ? from
        : homeFor[data.role];
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
      shakeControls.start({ x: [0, -10, 10, -6, 6, -2, 0], transition: { duration: 0.45 } });
    }
  }

  const isDoctor = role === 'doctor';

  return (
    <AuthLayout variant={role}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue to your MediCare account.</p>

        <div className="role-switch" role="tablist" aria-label="Account type">
          {roles.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={role === id}
              className={role === id ? 'active' : ''}
              onClick={() => setRole(id)}
            >
              {role === id && <motion.span layoutId="role-pill" className="role-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
              <span className="role-label"><Icon size={16} /> {label}</span>
            </button>
          ))}
        </div>

        <motion.form onSubmit={submit} className="auth-form-modern" animate={shakeControls}>
          <Field label={isDoctor ? 'Work email' : 'Email address'} icon={Mail} type="text" inputMode="email" autoCapitalize="none" spellCheck={false} name="email" autoComplete="username" required autoFocus />
          <Field label="Password" icon={Lock} type="password" name="password" autoComplete="current-password" required />

          <AnimatePresence>
            {error && (
              <motion.div
                className="form-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" className="btn-cta" disabled={busy}>
            {busy ? <span className="spinner" /> : <>Sign in as {isDoctor ? 'doctor' : 'patient'} <ArrowRight size={18} className="cta-arrow" /></>}
          </button>
        </motion.form>

        {session.mockMode && (
          <motion.div className="mock-logins" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span><FlaskConical size={14} /> Mock mode – one-click demo logins</span>
            <div>
              {mockAccounts.map((account) => (
                <button key={account.label} type="button" disabled={busy} onClick={() => signIn(account.body)}>
                  <strong>{account.label}</strong>
                  <small>{account.body.email} / {account.body.password}</small>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.p
            key={role}
            className="auth-switch"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {isDoctor ? (
              <>Want to practice on MediCare? <Link to="/doctor/register">Apply as a doctor</Link></>
            ) : (
              <>New to MediCare? <Link to="/signup">Create a free account</Link></>
            )}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </AuthLayout>
  );
}
