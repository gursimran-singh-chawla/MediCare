const User = require('../models/user');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { sendDoctorApproval, sendDoctorRejection } = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const { stripSensitive } = require('../utils/serialize');
const { pendingDoctorQuery, doctorAppointmentsQuery } = require('../utils/queries');

const DOCTOR_STATUSES = ['pending', 'approved', 'rejected'];

const dashboard = asyncHandler(async (_req, res) => {
  const [
    totalDoctors,
    pendingDoctors,
    approvedDoctors,
    rejectedDoctors,
    totalPatients,
    totalAppointments
  ] = await Promise.all([
    Doctor.countDocuments(),
    Doctor.countDocuments(pendingDoctorQuery),
    Doctor.countDocuments({ status: 'approved' }),
    Doctor.countDocuments({ status: 'rejected' }),
    User.countDocuments(),
    Appointment.countDocuments()
  ]);

  res.json({
    success: true,
    stats: {
      totalDoctors,
      pendingDoctors,
      approvedDoctors,
      rejectedDoctors,
      totalPatients,
      totalAppointments
    }
  });
});

const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
  res.json({ success: true, doctor: stripSensitive(doctor) });
});

const listDoctorsByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  if (!DOCTOR_STATUSES.includes(status)) return res.status(400).json({ success: false, message: 'Invalid doctor status.' });

  const query = status === 'pending' ? pendingDoctorQuery : { status };
  const doctors = await Doctor.find(query).sort({ createdAt: -1 });
  res.json({
    success: true,
    doctors: doctors.map(stripSensitive),
    status,
    pageTitle: `${status.charAt(0).toUpperCase()}${status.slice(1)} Doctors`
  });
});

const listDoctorAppointments = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

  const appointments = await Appointment.find(doctorAppointmentsQuery(doctor)).sort({ createdAt: -1 });
  res.json({ success: true, doctor: stripSensitive(doctor), appointments });
});

const approveDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', approvedAt: new Date(), rejectionReason: '' },
    { new: true }
  );

  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

  await sendDoctorApproval(doctor);
  res.json({ success: true, message: `${doctor.name} has been approved.`, doctor: stripSensitive(doctor) });
});

const rejectDoctor = asyncHandler(async (req, res) => {
  const rejectionReason = (req.body.rejectionReason || '').trim();
  if (!rejectionReason) return res.status(400).json({ success: false, message: 'Rejection reason is required.' });

  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', rejectionReason, approvedAt: null },
    { new: true }
  );

  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

  await sendDoctorRejection(doctor, rejectionReason);
  res.json({ success: true, message: `${doctor.name} has been rejected.`, doctor: stripSensitive(doctor) });
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
  res.json({ success: true, message: `Dr. ${doctor.name} has been removed from MediCare.` });
});

module.exports = {
  dashboard,
  getDoctor,
  listDoctorsByStatus,
  listDoctorAppointments,
  approveDoctor,
  rejectDoctor,
  deleteDoctor
};
