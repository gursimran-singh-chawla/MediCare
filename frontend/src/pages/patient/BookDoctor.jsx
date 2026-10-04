import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BadgeCheck, Calendar, Clock3, Info, Mail, Phone, User } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout.jsx';
import Field from '../../components/Field.jsx';
import Loader from '../../components/Loader.jsx';
import DoctorReviews from '../../components/DoctorReviews.jsx';
import { Stars } from '../../components/StarRating.jsx';
import { api } from '../../api/client.js';
import { doctorImage } from '../../utils/doctorImage.js';
import { useApp } from '../../context/AppContext.jsx';

const MIN_MINUTES = 5;

function nextDays(count) {
  return Array.from({ length: count }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });
}

const isoDate = (date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export default function BookDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { session, setAlert } = useApp();
  const [doctor, setDoctor] = useState(null);
  const [failed, setFailed] = useState(false);
  const [date, setDate] = useState(isoDate(new Date()));
  const [time, setTime] = useState('');
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState(null);
  const onSummary = useCallback((value) => setSummary(value), []);

  useEffect(() => {
    if (doctor && location.hash === '#reviews') {
      setTimeout(() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
    }
  }, [doctor, location.hash]);

  useEffect(() => {
    api(`/api/doctors/${id}`)
      .then((data) => setDoctor(data.doctor))
      .catch((error) => { setFailed(true); setAlert({ type: 'error', message: error.message }); });
  }, [id, setAlert]);

  async function submit(event) {
    event.preventDefault();
    if (!time) {
      setAlert({ type: 'error', message: 'Please pick a time slot.' });
      return;
    }
    const body = {
      ...Object.fromEntries(new FormData(event.currentTarget).entries()),
      doctorId: doctor._id,
      appointmentDate: date,
      appointmentTime: time
    };
    setBusy(true);
    try {
      const data = await api('/api/appointments', { method: 'POST', body });
      sessionStorage.setItem('lastPayment', JSON.stringify(data));
      navigate('/payment', { state: { payment: data } });
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
      setBusy(false);
    }
  }

  if (failed) {
    return (
      <PublicLayout>
        <section className="center-section">
          <div className="empty-modern">
            <h3>This doctor isn’t available right now</h3>
            <Link className="btn btn-primary" to="/appointment">Browse doctors</Link>
          </div>
        </section>
      </PublicLayout>
    );
  }

  if (!doctor) return <PublicLayout><Loader label="Loading doctor" /></PublicLayout>;

  const rating = summary || doctor.rating || { average: 0, count: 0 };

  return (
    <PublicLayout>
      <section className="page-container booking-page">
        <Link className="back-link" to="/appointment"><ArrowLeft size={16} /> All doctors</Link>
        <div className="booking-grid">
          <motion.aside className="card-modern doctor-profile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="doctor-profile-photo">
              <img src={doctorImage(doctor)} alt={doctor.name} />
            </div>
            <span className="doc-card-specialty">{doctor.specialization}</span>
            <h1>Dr. {doctor.name}</h1>
            <p className="muted">{doctor.degree}</p>
            <a className="profile-rating" href="#reviews">
              {rating.count ? <><Stars value={rating.average} size={16} /> <strong>{rating.average.toFixed(1)}</strong> <span>· {rating.count} review{rating.count > 1 ? 's' : ''}</span></> : <span>No reviews yet · be the first</span>}
            </a>
            <div className="profile-facts">
              <div><BadgeCheck size={16} /> Verified doctor</div>
              <div><Clock3 size={16} /> {doctor.experience}+ years experience</div>
              <div><Calendar size={16} /> {doctor.availableDays?.length ? doctor.availableDays.join(', ') : 'Availability on request'}</div>
            </div>
            <div className="price-box">
              <div><small>Consultation fee</small><strong>₹{doctor.price}<span>/min</span></strong></div>
              <div><small>Minimum ({MIN_MINUTES} min)</small><strong>₹{Number(doctor.price) * MIN_MINUTES}</strong></div>
            </div>
          </motion.aside>

          <motion.form className="card-modern booking-form" onSubmit={submit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
            <h2>Book your appointment</h2>

            <div className="booking-step">
              <span className="step-label">1. Pick a date</span>
              <div className="date-scroller">
                {nextDays(10).map((day) => {
                  const value = isoDate(day);
                  return (
                    <button key={value} type="button" className={`date-chip ${date === value ? 'active' : ''}`} onClick={() => setDate(value)}>
                      <small>{day.toLocaleDateString(undefined, { weekday: 'short' })}</small>
                      <strong>{day.getDate()}</strong>
                      <small>{day.toLocaleDateString(undefined, { month: 'short' })}</small>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="booking-step">
              <span className="step-label">2. Choose a time</span>
              <div className="time-grid">
                {timeSlots.map((slot) => (
                  <button key={slot} type="button" className={`time-chip ${time === slot ? 'active' : ''}`} onClick={() => setTime(slot)}>{slot}</button>
                ))}
              </div>
            </div>

            <div className="booking-step">
              <span className="step-label">3. Patient details</span>
              <div className="stack-md">
                <Field label="Patient name" icon={User} name="patientName" defaultValue={session?.user?.name || ''} required />
                <div className="form-row-2">
                  <Field label="Email" icon={Mail} type="email" name="patientEmail" defaultValue={session?.user?.email || ''} required />
                  <Field label="Mobile number" icon={Phone} type="tel" name="appointmentNumber" required />
                </div>
              </div>
            </div>

            <div className="info-note"><Info size={16} /> Billing starts at {MIN_MINUTES} minutes. You’ll pay securely before your appointment is confirmed.</div>

            <button type="submit" className="btn-cta" disabled={busy}>
              {busy ? <span className="spinner" /> : <>Continue to payment · ₹{Number(doctor.price) * MIN_MINUTES} <ArrowRight size={18} className="cta-arrow" /></>}
            </button>
          </motion.form>
        </div>

        <DoctorReviews doctorId={doctor._id} onSummary={onSummary} />
      </section>
    </PublicLayout>
  );
}
