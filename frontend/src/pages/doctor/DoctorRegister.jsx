import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Award, BadgeCheck, Briefcase, CalendarDays, FileUp, GraduationCap, IdCard,
  ImageUp, IndianRupee, Lock, Mail, MapPin, Phone, Stethoscope, User
} from 'lucide-react';
import Field from '../../components/Field.jsx';
import { api } from '../../api/client.js';
import { useApp } from '../../context/AppContext.jsx';

function FileDrop({ name, label, icon: Icon, accept, multiple, required }) {
  const [files, setFiles] = useState([]);
  return (
    <label className={`file-drop ${files.length ? 'has-file' : ''}`}>
      <input type="file" name={name} accept={accept} multiple={multiple} required={required} onChange={(event) => setFiles([...event.target.files])} />
      <span className="file-drop-icon"><Icon size={20} /></span>
      <span className="file-drop-text">
        <strong>{label}</strong>
        <small>{files.length ? files.map((file) => file.name).join(', ') : `Click to upload${required ? '' : ' (optional)'}`}</small>
      </span>
    </label>
  );
}

export default function DoctorRegister() {
  const navigate = useNavigate();
  const { setAlert } = useApp();
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await api('/api/doctor/register', { method: 'POST', body: new FormData(event.currentTarget) });
      setAlert({ type: 'success', message: data.message });
      navigate('/login', { state: { role: 'doctor' } });
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
      setBusy(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-bg"><span className="blob blob-1" /><span className="blob blob-2" /></div>
      <div className="register-wrap">
        <Link to="/login" state={{ role: 'doctor' }} className="auth-back"><ArrowLeft size={16} /> Back to doctor sign in</Link>
        <motion.div className="register-head" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="pill-badge"><Stethoscope size={14} /> Join as a doctor</span>
          <h1>Grow your practice with MediCare.</h1>
          <p>Submit your details for verification. Our team reviews every application, usually within 48 hours.</p>
        </motion.div>

        <motion.form className="card-modern register-form" onSubmit={submit} encType="multipart/form-data" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <fieldset>
            <legend><span>1</span> Account</legend>
            <div className="form-row-2">
              <Field label="Full name" icon={User} name="name" required />
              <Field label="Email" icon={Mail} type="email" name="email" required />
              <Field label="Password" icon={Lock} type="password" name="password" minLength="6" required />
              <Field label="Phone number" icon={Phone} name="phone" required />
            </div>
          </fieldset>

          <fieldset>
            <legend><span>2</span> Professional details</legend>
            <div className="form-row-2">
              <Field label="Specialization" icon={Stethoscope} name="specialization" required />
              <Field label="Degree (MBBS, MD…)" icon={GraduationCap} name="degree" required />
              <Field label="Medical licence number" icon={BadgeCheck} name="medicalLicense" required />
              <Field label="Aadhaar number" icon={IdCard} name="aadhar" required />
              <Field label="Experience (years)" icon={Briefcase} type="number" name="experience" min="0" required />
              <Field label="Fee (₹ per minute)" icon={IndianRupee} type="number" name="price" min="1" required />
            </div>
            <div className="stack-md" style={{ marginTop: 14 }}>
              <Field label="Clinic address" icon={MapPin} name="address" required />
              <Field label="Available days (Mon, Wed, Fri)" icon={CalendarDays} name="availableDays" required />
            </div>
          </fieldset>

          <fieldset>
            <legend><span>3</span> Documents</legend>
            <div className="file-grid">
              <FileDrop name="image" label="Profile photo" icon={ImageUp} accept="image/*" required />
              <FileDrop name="document" label="Verification document" icon={FileUp} accept=".pdf,image/*" required />
              <FileDrop name="certificates" label="Certificates" icon={Award} accept=".pdf,image/*" multiple />
            </div>
          </fieldset>

          <button type="submit" className="btn-cta" disabled={busy}>
            {busy ? <><span className="spinner" /> Uploading</> : <>Submit for verification <ArrowRight size={18} className="cta-arrow" /></>}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
