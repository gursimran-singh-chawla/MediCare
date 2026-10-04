import { Link } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer-modern">
      <div className="footer-cta">
        <div>
          <h3>Your next appointment is a few taps away.</h3>
          <p>Verified specialists, transparent per-minute pricing, instant receipts.</p>
        </div>
        <Link className="btn btn-light-on-dark" to="/appointment">Find a doctor</Link>
      </div>
      <div className="site-footer-grid">
        <div>
          <strong className="site-brand footer-brand"><span className="site-brand-mark">M</span>MediCare</strong>
          <p className="footer-copy">Verified doctor appointments, secure payments, receipts, meeting links, and prescriptions in one place.</p>
          <span className="footer-badge"><ShieldCheck size={14} /> Payments secured by Razorpay</span>
        </div>
        <div>
          <h3>Care</h3>
          <Link to="/appointment">Find Doctors</Link>
          <Link to="/services">Services</Link>
          <Link to="/my-bookings">My Bookings</Link>
        </div>
        <div>
          <h3>Account</h3>
          <Link to="/signup">Create account</Link>
          <Link to="/login">Sign in</Link>
          <Link to="/donate">Donate</Link>
        </div>
        <div>
          <h3>Company</h3>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <a href="mailto:hello@medicare.example"><Mail size={14} style={{ verticalAlign: '-2px' }} /> Email us</a>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} MediCare. All rights reserved.</span>
        <span>Made with care in India</span>
      </div>
    </footer>
  );
}
