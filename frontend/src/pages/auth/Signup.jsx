import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Lock, Mail, User } from 'lucide-react';
import AuthLayout from '../../components/AuthLayout.jsx';
import Field from '../../components/Field.jsx';
import { api } from '../../api/client.js';
import { useApp } from '../../context/AppContext.jsx';

const genders = [['male', 'Male'], ['female', 'Female'], ['other', 'Other']];

function passwordScore(value) {
  let score = 0;
  if (value.length >= 6) score += 1;
  if (value.length >= 10) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

const strengthLabels = ['Too short', 'Weak', 'Okay', 'Good', 'Strong'];

export default function Signup() {
  const navigate = useNavigate();
  const { setAlert } = useApp();
  const [gender, setGender] = useState('female');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const score = passwordScore(password);

  async function submit(event) {
    event.preventDefault();
    const body = { ...Object.fromEntries(new FormData(event.currentTarget).entries()), gender };
    setBusy(true);
    try {
      const data = await api('/api/auth/signup', { method: 'POST', body });
      setAlert({ type: 'success', message: data.message });
      navigate('/login', { state: { role: 'patient' } });
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
      setBusy(false);
    }
  }

  return (
    <AuthLayout variant="patient">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">It takes less than a minute. No paperwork, ever.</p>

        <form onSubmit={submit} className="auth-form-modern">
          <Field label="Full name" icon={User} name="name" autoComplete="name" required autoFocus />
          <Field label="Email address" icon={Mail} type="email" name="email" autoComplete="email" required />
          <div>
            <Field
              label="Password"
              icon={Lock}
              type="password"
              name="password"
              minLength="6"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {password && (
              <div className="strength">
                <div className="strength-bars">
                  {[0, 1, 2, 3].map((index) => <span key={index} className={index < score ? `on s${score}` : ''} />)}
                </div>
                <small>{strengthLabels[score]}</small>
              </div>
            )}
          </div>
          <div className="form-row-2">
            <Field label="Age" icon={CalendarDays} type="number" name="age" min="1" max="120" required />
            <div className="chip-group" role="radiogroup" aria-label="Gender">
              {genders.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={gender === value}
                  className={`chip ${gender === value ? 'active' : ''}`}
                  onClick={() => setGender(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-cta" disabled={busy}>
            {busy ? <span className="spinner" /> : <>Create account <ArrowRight size={18} className="cta-arrow" /></>}
          </button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </motion.div>
    </AuthLayout>
  );
}
