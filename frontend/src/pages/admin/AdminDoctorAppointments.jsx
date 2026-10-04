import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import WorkspaceLayout from '../../components/WorkspaceLayout.jsx';
import AppointmentsTable from '../../components/AppointmentsTable.jsx';
import Loader from '../../components/Loader.jsx';
import { api, assetUrl } from '../../api/client.js';
import { fallbackToDummy } from '../../utils/doctorImage.js';
import { useApp } from '../../context/AppContext.jsx';

export default function AdminDoctorAppointments() {
  const { id } = useParams();
  const { setAlert } = useApp();
  const [data, setData] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api(`/api/admin/doctors/${id}/appointments`).then(setData).catch((error) => setAlert({ type: 'error', message: error.message }));
  }, [id, setAlert]);

  if (!data) return <WorkspaceLayout role="admin" title="Appointments"><Loader label="Loading appointments" /></WorkspaceLayout>;

  const { doctor, appointments } = data;
  const status = doctor.status || 'pending';
  const filtered = appointments.filter((appointment) => JSON.stringify(appointment).toLowerCase().includes(query.toLowerCase()));

  return (
    <WorkspaceLayout
      role="admin"
      title={`Dr. ${doctor.name}`}
      subtitle={`${doctor.specialization} · ${doctor.email} · ${doctor.phone}`}
      actions={<Link className="btn btn-ghost-modern" to={`/admin/doctors/${status}`}><ArrowLeft size={16} /> Back</Link>}
    >
      <section className="card-modern table-card">
        <div className="table-toolbar">
          <div className="toolbar-doc">
            <img className="avatar-img" src={assetUrl(doctor.image)} alt={doctor.name} onError={fallbackToDummy(doctor)} />
            <div><h3>{appointments.length} appointment{appointments.length === 1 ? '' : 's'}</h3><span className={`badge badge-${status === 'approved' ? 'confirmed' : status}`}>{status}</span></div>
          </div>
          <div className="input-icon"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search appointments" /></div>
        </div>
        <AppointmentsTable appointments={filtered} />
      </section>
    </WorkspaceLayout>
  );
}
