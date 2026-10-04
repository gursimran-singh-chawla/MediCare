import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';

export default function NotFound() {
  return (
    <PublicLayout footer={false}>
      <section className="center-section">
        <motion.div className="not-found" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="nf-code text-gradient">404</span>
          <h1>This page took a sick day.</h1>
          <p>The page you’re looking for doesn’t exist or has moved.</p>
          <Link className="btn btn-primary btn-lg" to="/"><ArrowLeft size={18} /> Back to home</Link>
        </motion.div>
      </section>
    </PublicLayout>
  );
}
