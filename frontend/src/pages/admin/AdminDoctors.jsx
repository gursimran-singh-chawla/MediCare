import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Check, ChevronLeft, ChevronRight, FileText, Search, Trash2, X } from 'lucide-react';
import WorkspaceLayout from '../../components/WorkspaceLayout.jsx';
import Loader from '../../components/Loader.jsx';
import NotFound from '../NotFound.jsx';
import { api, assetUrl } from '../../api/client.js';
import { fallbackToDummy } from '../../utils/doctorImage.js';
import { useApp } from '../../context/AppContext.jsx';

const STATUSES = ['pending', 'approved', 'rejected'];
const PAGE_SIZE = 8;

export default function AdminDoctors() {
  const { status } = useParams();
  const { setAlert } = useApp();
  const [doctors, setDoctors] = useState(null);
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const validStatus = STATUSES.includes(status);

  const load = useCallback(() => {
    api(`/api/admin/doctors/${status}`)
      .then((data) => { setDoctors(data.doctors); setTitle(data.pageTitle); })
      .catch((error) => { setDoctors([]); setAlert({ type: 'error', message: error.message }); });
  }, [status, setAlert]);

  useEffect(() => {
    if (!validStatus) return;
    setDoctors(null);
    load();
    setPage(1);
  }, [load, validStatus]);

  if (!validStatus) return <NotFound />;

  const list = doctors || [];
  const filtered = list.filter((doctor) => JSON.stringify(doctor).toLowerCase().includes(query.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function approve(id) {
    try {
      const data = await api(`/api/admin/doctors/${id}/approve`, { method: 'POST' });
      setAlert({ type: 'success', message: data.message });
      load();
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  }

  async function remove(id, name) {
    if (!window.confirm(`Remove Dr. ${name} from MediCare? This cannot be undone.`)) return;
    try {
      const data = await api(`/api/admin/doctors/${id}`, { method: 'DELETE' });
      setAlert({ type: 'success', message: data.message });
      load();
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  }

  return (
    <WorkspaceLayout
      role="admin"
      title={title || 'Doctors'}
      subtitle="Inspect documents, approve, reject or remove doctors."
      actions={<div className="input-icon"><Search size={16} /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} type="search" placeholder="Search doctors" /></div>}
    >
      {!doctors ? <Loader label="Loading doctors" /> : visible.length === 0 ? (
        <div className="empty-modern"><h3>No {status} doctors</h3><p>Nothing to review here right now.</p></div>
      ) : (
        <div className="admin-doc-list">
          <AnimatePresence mode="popLayout">
            {visible.map((doctor, index) => (
              <motion.article
                key={doctor._id}
                layout
                className="admin-doc"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ delay: Math.min(index * 0.04, 0.25) }}
              >
                <img src={assetUrl(doctor.image)} alt={doctor.name} onError={fallbackToDummy(doctor)} />
                <div className="admin-doc-main">
                  <h3>Dr. {doctor.name}</h3>
                  <p>{doctor.specialization} · {doctor.degree} · {doctor.experience} yrs</p>
                  <div className="admin-doc-meta">
                    <span>{doctor.email}</span>
                    <span>{doctor.phone}</span>
                    <span>Licence {doctor.medicalLicense}</span>
                    <span>Aadhaar {doctor.aadhar}</span>
                    <span>Joined {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {doctor.rejectionReason && status === 'rejected' && <p className="reject-reason">Reason: {doctor.rejectionReason}</p>}
                  <div className="doc-links">
                    {doctor.document && <a className="chip-link" href={assetUrl(doctor.document)} target="_blank" rel="noreferrer"><FileText size={13} /> Document</a>}
                    {doctor.certificates?.map((file, fileIndex) => <a className="chip-link" href={assetUrl(file)} target="_blank" rel="noreferrer" key={file}><FileText size={13} /> Certificate {fileIndex + 1}</a>)}
                  </div>
                </div>
                <div className="admin-doc-actions">
                  {status === 'pending' && <button className="btn btn-success btn-sm-modern" type="button" onClick={() => approve(doctor._id)}><Check size={15} /> Approve</button>}
                  {status === 'pending' && <Link className="btn btn-danger btn-sm-modern" to={`/admin/reject/${doctor._id}`}><X size={15} /> Reject</Link>}
                  <Link className="btn btn-ghost-modern btn-sm-modern" to={`/admin/doctors/${doctor._id}/appointments`}><CalendarDays size={15} /> Appointments</Link>
                  <button className="icon-btn danger" type="button" onClick={() => remove(doctor._id, doctor.name)} title="Remove doctor"><Trash2 size={16} /></button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}

      {doctors && filtered.length > PAGE_SIZE && (
        <div className="pager">
          <span>{filtered.length} doctors · Page {page} of {totalPages}</span>
          <div className="actions">
            <button className="icon-btn" type="button" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
            <button className="icon-btn" type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}
