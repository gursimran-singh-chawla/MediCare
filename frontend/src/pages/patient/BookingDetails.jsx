import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Pill, Printer, Receipt, Video } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout.jsx';
import Badge from '../../components/Badge.jsx';
import Loader from '../../components/Loader.jsx';
import { api } from '../../api/client.js';
import { useApp } from '../../context/AppContext.jsx';
import { formatDateTime } from '../../utils/format.js';

export default function BookingDetails() {
  const { id } = useParams();
  const { setAlert } = useApp();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    api(`/api/patient/bookings/${id}`).then((data) => setAppointment(data.appointment)).catch((error) => setAlert({ type: 'error', message: error.message }));
  }, [id, setAlert]);

  if (!appointment) return <PublicLayout><Loader label="Loading booking" /></PublicLayout>;
  const prescription = appointment.prescription;
  const medicines = prescription?.medicines || [];

  return (
    <PublicLayout>
      <section className="page-container booking-page">
        <Link className="back-link no-print" to="/my-bookings"><ArrowLeft size={16} /> My bookings</Link>
        <motion.div className="card-modern" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="details-head">
            <div>
              <span className="eyebrow">Booking</span>
              <h1>Dr. {appointment.doctorName}</h1>
              <p className="muted">{appointment.date} · {appointment.time}</p>
            </div>
            <div className="booking-meta">
              <Badge value={appointment.appointmentStatus} />
              <Badge value={appointment.paymentStatus} />
            </div>
          </div>
          <div className="details-grid">
            <div><small>Patient</small><strong>{appointment.patientName}</strong></div>
            <div><small>Receipt</small><strong>{appointment.receiptNumber || 'N/A'}</strong></div>
            <div><small>Payment ID</small><strong className="mono">{appointment.paymentId || 'N/A'}</strong></div>
            <div><small>Booking ID</small><strong className="mono">{appointment._id}</strong></div>
          </div>
          <div className="actions no-print">
            {appointment.meetingLink && <a className="btn btn-primary" href={appointment.meetingLink} target="_blank" rel="noreferrer"><Video size={17} /> Join meeting</a>}
            {appointment.paymentStatus === 'paid' && <Link className="btn btn-ghost-modern" to={`/receipt/${appointment._id}`}><Receipt size={17} /> Receipt</Link>}
          </div>
        </motion.div>

        <motion.div className="card-modern rx-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="details-head">
            <h2><FileText size={20} /> Prescription</h2>
            {prescription?.updatedAt && <button type="button" className="btn btn-ghost-modern btn-sm-modern no-print" onClick={() => window.print()}><Printer size={15} /> Print</button>}
          </div>
          {prescription?.updatedAt ? (
            <>
              <div className="details-grid">
                <div><small>Diagnosis</small><strong>{prescription.diagnosis || 'N/A'}</strong></div>
                <div><small>Updated</small><strong>{formatDateTime(prescription.updatedAt)}</strong></div>
              </div>
              {prescription.notes && <p className="rx-notes">{prescription.notes}</p>}
              <div className="med-list">
                {medicines.map((medicine, index) => (
                  <motion.div key={`${medicine.name}-${index}`} className="med-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + index * 0.05 }}>
                    <span className="med-icon"><Pill size={16} /></span>
                    <div>
                      <strong>{medicine.name} <small>{medicine.dosage}</small></strong>
                      <p>{medicine.frequency} · {medicine.duration}{medicine.instructions ? ` · ${medicine.instructions}` : ''}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <p className="muted">Your doctor hasn’t added a prescription yet. We’ll show it here as soon as they do.</p>
          )}
        </motion.div>
      </section>
    </PublicLayout>
  );
}
