import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import WorkspaceLayout from '../../components/WorkspaceLayout.jsx';
import { api } from '../../api/client.js';
import { useApp } from '../../context/AppContext.jsx';

const quickReasons = ['Document unclear or unreadable', 'Licence number could not be verified', 'Profile details incomplete'];

export default function RejectDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setAlert } = useApp();
  const [doctor, setDoctor] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/api/admin/doctor/${id}`).then((data) => setDoctor(data.doctor)).catch((error) => setAlert({ type: 'error', message: error.message }));
  }, [id, setAlert]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await api(`/api/admin/doctors/${id}/reject`, { method: 'POST', body: { rejectionReason: reason } });
      setAlert({ type: 'success', message: data.message });
      navigate('/admin/doctors/pending');
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
      setBusy(false);
    }
  }

  return (
    <WorkspaceLayout
      role="admin"
      title={`Reject Dr. ${doctor?.name || ''}`}
      subtitle="The reason is saved and emailed to the doctor."
      actions={<Link className="btn btn-ghost-modern" to="/admin/doctors/pending"><ArrowLeft size={16} /> Cancel</Link>}
    >
      <form className="card-modern stack-lg reject-card" onSubmit={submit}>
        <div className="chip-group wrap">
          {quickReasons.map((item) => <button key={item} type="button" className="chip" onClick={() => setReason(item)}>{item}</button>)}
        </div>
        <label className="label-modern">Rejection reason<textarea rows="5" value={reason} onChange={(e) => setReason(e.target.value)} required /></label>
        <button className="btn btn-danger btn-lg" type="submit" disabled={busy}>
          {busy ? <span className="spinner" /> : <><X size={17} /> Reject doctor</>}
        </button>
      </form>
    </WorkspaceLayout>
  );
}
