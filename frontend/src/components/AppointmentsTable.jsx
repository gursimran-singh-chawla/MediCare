import { Link } from 'react-router-dom';
import Badge from './Badge.jsx';
import { formatDateTime } from '../utils/format.js';

export default function AppointmentsTable({ appointments, doctorMode = false }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Patient</th><th>Contact</th><th>Date</th><th>Time</th><th>Appointment</th><th>Payment</th><th>Amount</th><th>Payment ID</th><th>Order ID</th><th>Booked At</th>{doctorMode && <th>Prescription</th>}</tr></thead>
        <tbody>
          {appointments.length === 0 && <tr><td colSpan={doctorMode ? 11 : 10} style={{ textAlign: 'center', padding: 36 }}>No appointments found.</td></tr>}
          {appointments.map((appointment) => (
            <tr key={appointment._id}>
              <td><strong>{appointment.patientName}</strong><br /><span>Patient record</span></td>
              <td><strong>Email:</strong> {appointment.patientEmail}<br /><strong>Phone:</strong> {appointment.patientPhone || 'N/A'}</td>
              <td>{appointment.date}</td>
              <td>{appointment.time}</td>
              <td><Badge value={appointment.appointmentStatus} /></td>
              <td><Badge value={appointment.paymentStatus} /></td>
              <td>{appointment.amount ? `INR ${appointment.amount}` : 'N/A'}</td>
              <td>{appointment.paymentId || 'N/A'}</td>
              <td>{appointment.orderId || 'N/A'}</td>
              <td>{formatDateTime(appointment.createdAt)}</td>
              {doctorMode && <td><Link className="doc-link" to={`/doctor/appointments/${appointment._id}/prescription`}>{appointment.prescription?.updatedAt ? 'Edit Prescription' : 'Add Prescription'}</Link></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
