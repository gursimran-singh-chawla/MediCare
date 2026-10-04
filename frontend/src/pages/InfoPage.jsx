import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, BadgeCheck, CalendarCheck2, CreditCard, FileText, FolderHeart, HeartHandshake, ShieldCheck, Video
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import { Reveal } from '../components/motion.jsx';

const pages = {
  about: {
    eyebrow: 'About us',
    title: 'Healthcare access, made simpler.',
    copy: 'MediCare connects you with verified doctors, secure online payments, instant receipts, meeting links and prescriptions — all in one focused place.',
    cards: [
      { icon: BadgeCheck, title: 'Verified care', copy: 'Every doctor’s credentials are checked before they can see patients.' },
      { icon: FolderHeart, title: 'Your records, together', copy: 'Receipts, meeting links and prescriptions stay in your booking history.' },
      { icon: HeartHandshake, title: 'Human first', copy: 'Clear pricing, no hidden fees and a team that actually replies.' }
    ]
  },
  services: {
    eyebrow: 'Services',
    title: 'Everything you need for online care.',
    copy: 'From finding the right specialist to keeping your prescriptions organised, MediCare takes care of the busywork.',
    cards: [
      { icon: CalendarCheck2, title: 'Doctor appointments', copy: 'Book verified specialists by specialty and consultation fee.' },
      { icon: Video, title: 'Online consultations', copy: 'Join a secure meeting link at your scheduled time — no app required.' },
      { icon: CreditCard, title: 'Secure payments', copy: 'Razorpay checkout confirms your appointment the moment you pay.' },
      { icon: FileText, title: 'Digital prescriptions', copy: 'View and print prescriptions written by your doctor.' },
      { icon: FolderHeart, title: 'Booking history', copy: 'Every appointment, receipt and meeting link in one timeline.' },
      { icon: ShieldCheck, title: 'Private by default', copy: 'Your health information is only visible to you and your doctor.' }
    ]
  }
};

export default function InfoPage({ type }) {
  const content = pages[type];

  return (
    <PublicLayout>
      <section className="page-hero center">
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="eyebrow">{content.eyebrow}</span>
            <h1>{content.title}</h1>
            <p>{content.copy}</p>
          </motion.div>
        </div>
      </section>
      <section className="page-container feature-grid">
        {content.cards.map(({ icon: Icon, title, copy }, index) => (
          <Reveal key={title} delay={index * 0.07} className="feature-card">
            <span className="step-icon"><Icon size={22} /></span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </Reveal>
        ))}
      </section>
      <Reveal className="page-container cta-band">
        <div>
          <h2>Ready when you are.</h2>
          <p>Find a verified specialist and book in under two minutes.</p>
        </div>
        <Link className="btn btn-primary btn-lg" to="/appointment">Find a doctor <ArrowRight size={18} className="cta-arrow" /></Link>
      </Reveal>
    </PublicLayout>
  );
}
