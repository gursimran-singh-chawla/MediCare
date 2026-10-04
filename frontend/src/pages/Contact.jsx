import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, Mail, MessageSquareText, Send, Tag, User } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import Field from '../components/Field.jsx';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';

const contactEmails = ['support@medicare.example', 'hello@medicare.example', 'care@medicare.example'];

export default function Contact() {
  const { session, setAlert } = useApp();
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    try {
      const data = await api('/api/contact', {
        method: 'POST',
        body: Object.fromEntries(new FormData(formElement).entries())
      });
      formElement.reset();
      setAlert({ type: 'success', message: data.message });
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicLayout>
      <section className="page-hero">
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="eyebrow">Contact</span>
            <h1>We’d love to hear from you.</h1>
            <p>Questions about appointments, payments or prescriptions? Send us a note.</p>
          </motion.div>
        </div>
      </section>
      <section className="page-container contact-grid">
        <motion.form className="card-modern stack-lg" onSubmit={submit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="form-row-2">
            <Field label="Full name" icon={User} name="name" defaultValue={session?.user?.name || ''} required />
            <Field label="Email address" icon={Mail} type="email" name="email" defaultValue={session?.user?.email || ''} required />
          </div>
          <Field label="Subject" icon={Tag} name="subject" required />
          <div className="field-float textarea has-icon">
            <MessageSquareText className="field-icon" size={18} />
            <textarea id="contact-message" name="message" placeholder=" " required />
            <label htmlFor="contact-message">Your message</label>
          </div>
          <button type="submit" className="btn-cta" disabled={busy}>
            {busy ? <span className="spinner" /> : <>Send message <Send size={17} className="cta-arrow" /></>}
          </button>
        </motion.form>
        <motion.aside className="contact-side" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card-modern">
            <span className="step-icon"><Clock3 size={20} /></span>
            <h3>Quick replies</h3>
            <p>We usually respond within one business day.</p>
          </div>
          <div className="card-modern">
            <span className="step-icon"><Mail size={20} /></span>
            <h3>Email the team</h3>
            {contactEmails.map((email) => <a key={email} className="contact-mail" href={`mailto:${email}`}>{email}</a>)}
          </div>
        </motion.aside>
      </section>
    </PublicLayout>
  );
}
