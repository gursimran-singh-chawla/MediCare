import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, HeartHandshake } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';

const UPI_ID = 'pritkaverma@okicici';

export default function Donate() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard?.writeText(UPI_ID).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <PublicLayout>
      <section className="center-section">
        <motion.div className="card-modern donate-card" initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}>
          <span className="empty-icon"><HeartHandshake size={28} /></span>
          <span className="eyebrow">Donate</span>
          <h1>Support accessible care.</h1>
          <p>Your contribution helps keep quality healthcare simple and reachable for everyone.</p>
          <button type="button" className="upi-box" onClick={copy}>
            <span>{UPI_ID}</span>
            {copied ? <><Check size={18} /> Copied</> : <><Copy size={18} /> Copy</>}
          </button>
        </motion.div>
      </section>
    </PublicLayout>
  );
}
