import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Baby, Bone, Brain, CalendarCheck2, CreditCard, FileText, HeartPulse,
  Minus, Plus, Search, ShieldCheck, Smile, Sparkles, Star, Stethoscope, Video, Wind
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import { CountUp, Reveal, staggerChild, staggerParent } from '../components/motion.jsx';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';

const specialties = [
  { icon: HeartPulse, label: 'Cardiology' },
  { icon: Brain, label: 'Neurology' },
  { icon: Smile, label: 'Dentistry' },
  { icon: Sparkles, label: 'Dermatology' },
  { icon: Bone, label: 'Orthopedics' },
  { icon: Wind, label: 'Pulmonology' },
  { icon: Baby, label: 'Pediatrics' },
  { icon: Stethoscope, label: 'General Physician' }
];

const steps = [
  { icon: Search, title: 'Find your specialist', copy: 'Filter verified doctors by specialty, experience and per-minute fee.' },
  { icon: CreditCard, title: 'Pay securely', copy: 'Razorpay checkout confirms your slot instantly — no phone calls.' },
  { icon: Video, title: 'Consult online', copy: 'Join with the meeting link we email you. No app to install.' },
  { icon: FileText, title: 'Get your prescription', copy: 'Digital prescription and receipt saved in My Bookings forever.' }
];

const testimonials = [
  { quote: 'I found a dermatologist, paid, and was on a video call within the hour. Incredibly smooth.', name: 'Ananya Gupta', meta: 'Patient · Jaipur' },
  { quote: 'Having every prescription in one place has made managing my father’s care so much easier.', name: 'Rahul Verma', meta: 'Patient · Pune' },
  { quote: 'Transparent pricing and instant receipts. This is how booking a doctor should feel.', name: 'Sneha Iyer', meta: 'Patient · Bengaluru' }
];

const faqs = [
  { q: 'Are the doctors verified?', a: 'Yes. Every doctor’s licence, degree and identity documents are reviewed by our team before they can accept appointments.' },
  { q: 'How does pricing work?', a: 'Each doctor sets a per-minute fee. Consultations are billed for a minimum of 5 minutes, and you see the exact amount before paying.' },
  { q: 'How do I join my consultation?', a: 'After payment you receive a secure meeting link by email. It is also available anytime in My Bookings.' },
  { q: 'Where can I find my prescription?', a: 'Once your doctor adds it, the prescription appears under the booking in My Bookings, ready to view or print.' }
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq">
      {faqs.map((item, index) => (
        <div key={item.q} className={`faq-item ${open === index ? 'open' : ''}`}>
          <button type="button" onClick={() => setOpen(open === index ? -1 : index)}>
            <span>{item.q}</span>
            {open === index ? <Minus size={18} /> : <Plus size={18} />}
          </button>
          <AnimatePresence initial={false}>
            {open === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="faq-body"
              >
                <p>{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { session } = useApp();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api('/api/doctors').then((data) => setDoctors(data.doctors || [])).catch(() => {});
  }, []);

  const firstName = session?.user?.name?.split(' ')[0];

  return (
    <PublicLayout>
      <section className="hero-modern">
        <div className="hero-bg">
          <span className="blob blob-1" />
          <span className="blob blob-2" />
          <span className="blob blob-3" />
          <div className="grid-overlay" />
        </div>

        <div className="page-container hero-modern-grid">
          <motion.div variants={staggerParent} initial="hidden" animate="show">
            <motion.span variants={staggerChild} className="pill-badge">
              <span className="pulse-dot" /> {firstName ? `Welcome back, ${firstName}` : 'Doctors available today'}
            </motion.span>
            <motion.h1 variants={staggerChild} className="hero-title">
              Healthcare that <span className="text-gradient">moves at your pace.</span>
            </motion.h1>
            <motion.p variants={staggerChild} className="hero-sub">
              Book verified specialists in minutes, pay securely, and keep every prescription and receipt in one beautifully simple place.
            </motion.p>
            <motion.div variants={staggerChild} className="hero-actions">
              <Link className="btn btn-primary btn-lg" to="/appointment">Find a doctor <ArrowRight size={18} className="cta-arrow" /></Link>
              {session?.user ? (
                <Link className="btn btn-ghost-modern btn-lg" to="/my-bookings">My bookings</Link>
              ) : (
                <Link className="btn btn-ghost-modern btn-lg" to="/signup">Create free account</Link>
              )}
            </motion.div>
            <motion.div variants={staggerChild} className="hero-trust">
              <div className="avatar-stack">
                {['AG', 'RV', 'SI', 'MK'].map((value, index) => <span key={value} style={{ '--i': index }}>{value}</span>)}
              </div>
              <div>
                <div className="stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                <small>Loved by thousands of patients</small>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-card main">
              <div className="hero-card-head">
                <span className="doc-avatar"><Stethoscope size={22} /></span>
                <div><strong>Dr. Aditi Sharma</strong><small>Cardiologist · 12 yrs</small></div>
                <span className="verified-chip"><ShieldCheck size={13} /> Verified</span>
              </div>
              <div className="slot-grid">
                {['09:30', '10:30', '11:00', '12:15', '16:00', '17:30'].map((slot, index) => (
                  <span key={slot} className={index === 1 ? 'slot active' : 'slot'}>{slot}</span>
                ))}
              </div>
              <div className="hero-card-foot">
                <span>₹40 / min</span>
                <span className="mini-btn">Book now</span>
              </div>
            </div>
            <div className="hero-card float float-1">
              <span className="float-card-icon green"><CalendarCheck2 size={18} /></span>
              <div><strong>Appointment confirmed</strong><small>Today, 10:30 AM</small></div>
            </div>
            <div className="hero-card float float-2">
              <span className="float-card-icon violet"><FileText size={18} /></span>
              <div><strong>Prescription ready</strong><small>3 medicines added</small></div>
            </div>
            <div className="hero-card float float-3">
              <div className="ecg">
                <svg viewBox="0 0 200 40" preserveAspectRatio="none"><path d="M0 20 H60 L70 6 L82 34 L94 12 L102 20 H200" /></svg>
              </div>
              <small>Heart rate · 72 bpm</small>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="marquee" aria-label="Specialties">
        <div className="marquee-track">
          {[...specialties, ...specialties].map(({ icon: Icon, label }, index) => (
            <Link to="/appointment" className="marquee-item" key={`${label}-${index}`}><Icon size={18} /> {label}</Link>
          ))}
        </div>
      </section>

      <section className="page-container stats-modern">
        {[
          { value: 24, suffix: '/7', label: 'Booking access' },
          { value: 5, suffix: ' min', label: 'Minimum consult' },
          { value: 100, suffix: '%', label: 'Verified doctors' },
          { value: Math.max(doctors.length, 1), suffix: '+', label: 'Specialists online' }
        ].map((item, index) => (
          <Reveal key={item.label} delay={index * 0.08} className="stat-modern">
            <strong><CountUp to={item.value} suffix={item.suffix} /></strong>
            <span>{item.label}</span>
          </Reveal>
        ))}
      </section>

      <section className="page-container section-modern">
        <Reveal className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>From symptom to prescription in four steps.</h2>
          <p>No waiting rooms, no phone queues, no lost paperwork.</p>
        </Reveal>
        <div className="steps-grid">
          {steps.map(({ icon: Icon, title, copy }, index) => (
            <Reveal key={title} delay={index * 0.1} className="step-card">
              <span className="step-num">0{index + 1}</span>
              <span className="step-icon"><Icon size={22} /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {doctors.length > 0 && (
        <section className="page-container section-modern">
          <Reveal className="section-head row">
            <div>
              <span className="eyebrow">Top specialists</span>
              <h2>Meet some of our doctors.</h2>
            </div>
            <Link className="link-arrow" to="/appointment">View all doctors <ArrowRight size={16} /></Link>
          </Reveal>
          <div className="doctor-grid">
            {doctors.slice(0, 3).map((doctor, index) => (
              <Reveal key={doctor._id} delay={index * 0.1}><DoctorCard doctor={doctor} /></Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="page-container section-modern">
        <Reveal className="section-head">
          <span className="eyebrow">Patient stories</span>
          <h2>People feel better with MediCare.</h2>
        </Reveal>
        <div className="testimonial-grid">
          {testimonials.map((item, index) => (
            <Reveal key={item.name} delay={index * 0.1} className="testimonial">
              <div className="stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
              <p>“{item.quote}”</p>
              <div className="testimonial-author">
                <span className="avatar-sm">{item.name.split(' ').map((part) => part[0]).join('')}</span>
                <div><strong>{item.name}</strong><small>{item.meta}</small></div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-container section-modern faq-section">
        <Reveal className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2>Questions, answered.</h2>
          <p>Still curious? <Link to="/contact">Talk to our team</Link>.</p>
        </Reveal>
        <Reveal delay={0.1}><Faq /></Reveal>
      </section>
    </PublicLayout>
  );
}
