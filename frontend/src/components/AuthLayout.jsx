import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarCheck2, FileText, ShieldCheck, Star, Stethoscope, Users } from 'lucide-react';

const content = {
  patient: {
    eyebrow: 'For patients',
    title: 'Care that fits around your life.',
    copy: 'Book verified specialists, pay securely, and keep every prescription and receipt in one calm place.',
    cards: [
      { icon: CalendarCheck2, title: 'Appointment confirmed', meta: 'Today · 10:30 AM · Video consult' },
      { icon: FileText, title: 'Prescription ready', meta: 'Dr. Aditi Sharma · 3 medicines' }
    ],
    quote: '“Booked a cardiologist in two minutes and had my prescription the same evening.”',
    author: 'Riya M., Delhi'
  },
  doctor: {
    eyebrow: 'For doctors',
    title: 'Your practice, beautifully organised.',
    copy: 'See paid appointments, patient contact details and write digital prescriptions from one dashboard.',
    cards: [
      { icon: Users, title: '12 patients this week', meta: '9 paid · 3 upcoming' },
      { icon: Stethoscope, title: 'Next consult in 15 min', meta: 'Meeting link ready' }
    ],
    quote: '“MediCare handles payments and records so I can focus on my patients.”',
    author: 'Dr. Arjun K., Dermatologist'
  }
};

export default function AuthLayout({ variant = 'patient', children }) {
  const data = content[variant];

  return (
    <div className="auth-page">
      <aside className={`auth-visual auth-visual-${variant}`}>
        <div className="mesh mesh-a" />
        <div className="mesh mesh-b" />
        <div className="mesh mesh-c" />
        <div className="auth-visual-inner">
          <Link to="/" className="site-brand auth-brand"><span className="site-brand-mark">M</span>MediCare</Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={variant}
              className="auth-visual-copy"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="pill-glass">{data.eyebrow}</span>
              <h2>{data.title}</h2>
              <p>{data.copy}</p>

              <div className="auth-float-cards">
                {data.cards.map(({ icon: Icon, title, meta }, index) => (
                  <motion.div
                    key={title}
                    className="float-card"
                    initial={{ opacity: 0, x: index % 2 ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.12, duration: 0.5 }}
                    style={{ animationDelay: `${index * 1.4}s` }}
                  >
                    <span className="float-card-icon"><Icon size={18} /></span>
                    <div><strong>{title}</strong><small>{meta}</small></div>
                  </motion.div>
                ))}
              </div>

              <figure className="auth-quote">
                <div className="stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                <blockquote>{data.quote}</blockquote>
                <figcaption>{data.author}</figcaption>
              </figure>
            </motion.div>
          </AnimatePresence>

          <div className="auth-trust"><ShieldCheck size={16} /> Encrypted sessions · Razorpay secured payments</div>
        </div>
      </aside>

      <main className="auth-main">
        <Link to="/" className="auth-back"><ArrowLeft size={16} /> Back to home</Link>
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
