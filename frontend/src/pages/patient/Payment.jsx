import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, FlaskConical, Lock, ShieldCheck, Stethoscope, User } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout.jsx';
import { api } from '../../api/client.js';
import { useApp } from '../../context/AppContext.jsx';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAlert } = useApp();
  const [busy, setBusy] = useState(false);
  const payment = location.state?.payment || JSON.parse(sessionStorage.getItem('lastPayment') || 'null');

  async function mockPay(succeed) {
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    try {
      if (!succeed) {
        await api('/api/payments/failed', { method: 'POST', body: { appointmentId: payment.appointment._id } });
        setAlert({ type: 'error', message: 'Mock payment failed. The booking is marked as failed.' });
        setBusy(false);
        return;
      }
      const data = await api('/api/payments/verify', {
        method: 'POST',
        body: { appointmentId: payment.appointment._id, razorpay_order_id: payment.order.id, mock: true }
      });
      sessionStorage.removeItem('lastPayment');
      navigate(data.redirectUrl);
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
      setBusy(false);
    }
  }

  function pay() {
    if (!payment) return;
    if (payment.mock) { mockPay(true); return; }
    if (!window.Razorpay) {
      setAlert({ type: 'error', message: 'Razorpay checkout could not be loaded. Check your connection and retry.' });
      return;
    }

    const checkout = new window.Razorpay({
      key: payment.razorpayKeyId,
      amount: payment.order.amount,
      currency: 'INR',
      name: 'MediCare',
      description: 'Doctor consultation payment',
      order_id: payment.order.id,
      prefill: {
        name: payment.appointment.patientName,
        email: payment.appointment.patientEmail,
        contact: payment.appointment.patientPhone || ''
      },
      theme: { color: '#0d9488' },
      handler: async (response) => {
        setBusy(true);
        try {
          const data = await api('/api/payments/verify', {
            method: 'POST',
            body: {
              appointmentId: payment.appointment._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }
          });
          sessionStorage.removeItem('lastPayment');
          navigate(data.redirectUrl);
        } catch (error) {
          setAlert({ type: 'error', message: error.message });
          setBusy(false);
        }
      }
    });

    checkout.on('payment.failed', async () => {
      await api('/api/payments/failed', { method: 'POST', body: { appointmentId: payment.appointment._id } }).catch(() => {});
      setAlert({ type: 'error', message: 'Payment failed. Please try again.' });
    });
    checkout.open();
  }

  if (!payment) {
    return (
      <PublicLayout>
        <section className="center-section">
          <div className="empty-modern">
            <h3>No payment in progress</h3>
            <p>Start by choosing a doctor and a time that works for you.</p>
            <Link className="btn btn-primary" to="/appointment">Find a doctor</Link>
          </div>
        </section>
      </PublicLayout>
    );
  }

  const { doctor, appointment, amount } = payment;
  return (
    <PublicLayout>
      <section className="center-section">
        <motion.div className="card-modern checkout-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="eyebrow">Checkout</span>
          <h1>Confirm & pay</h1>
          <div className="summary-list">
            <div><Stethoscope size={18} /><span>Doctor</span><strong>Dr. {doctor.name}<small>{doctor.specialization}</small></strong></div>
            <div><User size={18} /><span>Patient</span><strong>{appointment.patientName}</strong></div>
            <div><CalendarDays size={18} /><span>When</span><strong>{appointment.date} · {appointment.time}</strong></div>
          </div>
          <div className="total-row"><span>Total due</span><strong>₹{amount}</strong></div>
          <button className="btn-cta" type="button" disabled={busy} onClick={pay}>
            {busy ? <><span className="spinner" /> {payment.mock ? 'Processing mock payment' : 'Verifying payment'}</> : <><Lock size={17} /> {payment.mock ? `Pay ₹${amount} (mock)` : `Pay ₹${amount} securely`}</>}
          </button>
          {payment.mock && (
            <button type="button" className="btn btn-ghost-modern btn-full" disabled={busy} onClick={() => mockPay(false)}>Simulate a failed payment</button>
          )}
          <Link className="btn btn-ghost-modern btn-full" to="/appointment">Cancel</Link>
          {payment.mock
            ? <p className="secure-note mock-note"><FlaskConical size={14} /> Mock payment mode – no money is charged and no Razorpay keys are needed.</p>
            : <p className="secure-note"><ShieldCheck size={14} /> Payments are processed by Razorpay. We never see your card details.</p>}
        </motion.div>
      </section>
    </PublicLayout>
  );
}
