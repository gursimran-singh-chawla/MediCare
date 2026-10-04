import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import WorkspaceLayout from '../../components/WorkspaceLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { api } from '../../api/client.js';
import { useApp } from '../../context/AppContext.jsx';
import { emptyMedicine, frequencies } from '../../utils/format.js';

export default function PrescriptionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setAlert } = useApp();
  const [data, setData] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([emptyMedicine()]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/api/doctor/appointments/${id}/prescription`).then((result) => {
      const prescription = result.appointment.prescription;
      setData(result);
      setDiagnosis(prescription?.diagnosis || '');
      setNotes(prescription?.notes || '');
      setMedicines(prescription?.medicines?.length ? prescription.medicines : [emptyMedicine()]);
    }).catch((error) => setAlert({ type: 'error', message: error.message }));
  }, [id, setAlert]);

  function updateMedicine(index, key, value) {
    setMedicines((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await api(`/api/doctor/appointments/${id}/prescription`, { method: 'POST', body: { diagnosis, notes, medicines } });
      setAlert({ type: 'success', message: result.message });
      navigate('/doctor/dashboard');
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
      setBusy(false);
    }
  }

  if (!data) return <WorkspaceLayout role="doctor" title="Prescription"><Loader label="Loading appointment" /></WorkspaceLayout>;
  const { appointment } = data;

  return (
    <WorkspaceLayout
      role="doctor"
      title="Prescription sheet"
      subtitle={`${appointment.patientName} · ${appointment.date} at ${appointment.time}`}
      actions={<Link className="btn btn-ghost-modern" to="/doctor/dashboard"><ArrowLeft size={16} /> Back</Link>}
    >
      <div className="card-modern details-grid patient-strip">
        <div><small>Patient</small><strong>{appointment.patientName}</strong></div>
        <div><small>Contact</small><strong>{appointment.patientEmail}<br />{appointment.patientPhone || 'N/A'}</strong></div>
        <div><small>Payment ID</small><strong className="mono">{appointment.paymentId || 'N/A'}</strong></div>
        <div><small>Receipt</small><strong>{appointment.receiptNumber || 'N/A'}</strong></div>
      </div>

      <form onSubmit={submit} className="stack-lg">
        <div className="card-modern form-row-2">
          <label className="label-modern">Diagnosis<textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required /></label>
          <label className="label-modern">Doctor notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        </div>

        <div className="card-modern">
          <div className="table-toolbar">
            <h3>Medicines</h3>
            <button className="btn btn-ghost-modern btn-sm-modern" type="button" onClick={() => setMedicines((items) => [...items, emptyMedicine()])}><Plus size={15} /> Add medicine</button>
          </div>
          <div className="med-editor">
            <AnimatePresence initial={false}>
              {medicines.map((medicine, index) => (
                <motion.div key={index} className="med-row" layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }}>
                  <input value={medicine.name} onChange={(e) => updateMedicine(index, 'name', e.target.value)} placeholder="Medicine name" />
                  <input value={medicine.dosage} onChange={(e) => updateMedicine(index, 'dosage', e.target.value)} placeholder="Dosage e.g. 500mg" />
                  <select value={medicine.frequency} onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}>
                    {frequencies.map((frequency) => <option key={frequency} value={frequency}>{frequency}</option>)}
                  </select>
                  <input value={medicine.duration} onChange={(e) => updateMedicine(index, 'duration', e.target.value)} placeholder="Duration e.g. 5 days" />
                  <input value={medicine.instructions} onChange={(e) => updateMedicine(index, 'instructions', e.target.value)} placeholder="Instructions" />
                  <button
                    className="icon-btn danger"
                    type="button"
                    disabled={medicines.length === 1}
                    onClick={() => setMedicines((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                    aria-label="Remove medicine"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="sticky-actions">
          <button type="submit" className="btn-cta" disabled={busy}>
            {busy ? <span className="spinner" /> : <><Save size={17} /> Save prescription</>}
          </button>
        </div>
      </form>
    </WorkspaceLayout>
  );
}
