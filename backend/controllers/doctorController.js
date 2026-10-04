const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { sendDoctorRegistrationPending } = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const { stripSensitive } = require('../utils/serialize');
const { doctorAppointmentsQuery } = require('../utils/queries');

function calculateDoctorStats(appointments) {
  return {
    totalAppointments: appointments.length,
    confirmedAppointments: appointments.filter((appointment) => appointment.appointmentStatus === 'confirmed').length,
    paidAppointments: appointments.filter((appointment) => appointment.paymentStatus === 'paid').length,
    pendingPayments: appointments.filter((appointment) => appointment.paymentStatus === 'pending').length,
    failedPayments: appointments.filter((appointment) => appointment.paymentStatus === 'failed').length,
    totalRevenue: appointments
      .filter((appointment) => appointment.paymentStatus === 'paid')
      .reduce((sum, appointment) => sum + Number(appointment.amount || 0), 0)
  };
}

async function findDoctorAppointment(doctor, appointmentId) {
  return Appointment.findOne({ _id: appointmentId, ...doctorAppointmentsQuery(doctor) });
}

const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    aadhar,
    specialization,
    degree,
    medicalLicense,
    experience,
    price,
    address,
    availableDays
  } = req.body;

  const files = req.files || {};
  const imagePath = files.image ? `/uploads/${files.image[0].filename}` : '';
  const documentPath = files.document ? `/uploads/${files.document[0].filename}` : '';
  const certificates = (files.certificates || []).map((file) => `/uploads/${file.filename}`);

  const hashedPassword = await bcrypt.hash(password, 10);
  const doctor = await Doctor.create({
    name,
    email,
    password: hashedPassword,
    phone,
    aadhar,
    specialization,
    degree,
    medicalLicense,
    experience,
    price,
    address,
    availableDays: (availableDays || '').split(',').map((day) => day.trim()).filter(Boolean),
    image: imagePath,
    document: documentPath,
    certificates,
    status: 'pending'
  });

  await sendDoctorRegistrationPending(doctor);
  res.status(201).json({
    success: true,
    message: 'Your doctor account has been submitted for admin verification.',
    doctor: stripSensitive(doctor)
  });
});

const dashboard = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.session.doctor._id);
  if (!doctor || doctor.status !== 'approved') {
    req.session.doctor = null;
    return res.status(403).json({ success: false, message: 'Your account is awaiting admin approval.' });
  }

  req.session.doctor = doctor;
  const appointments = await Appointment.find(doctorAppointmentsQuery(doctor)).sort({ createdAt: -1 });

  res.json({
    success: true,
    doctor: stripSensitive(doctor),
    appointments,
    stats: calculateDoctorStats(appointments)
  });
});

const getPrescription = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.session.doctor._id);
  const appointment = await findDoctorAppointment(doctor, req.params.id);

  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found for your doctor account.' });
  }

  res.json({ success: true, doctor: stripSensitive(doctor), appointment });
});

const savePrescription = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.session.doctor._id);
  const appointment = await findDoctorAppointment(doctor, req.params.id);

  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found for your doctor account.' });
  }

  const medicines = (req.body.medicines || [])
    .map((medicine) => ({
      name: (medicine.name || '').trim(),
      dosage: (medicine.dosage || '').trim(),
      frequency: medicine.frequency || 'OD',
      duration: (medicine.duration || '').trim(),
      instructions: (medicine.instructions || '').trim()
    }))
    .filter((medicine) => medicine.name);

  appointment.prescription = {
    diagnosis: (req.body.diagnosis || '').trim(),
    notes: (req.body.notes || '').trim(),
    medicines,
    updatedAt: new Date()
  };

  await appointment.save();
  res.json({ success: true, message: 'Prescription saved. Patient can now view it in My Bookings.', appointment });
});

module.exports = { register, dashboard, getPrescription, savePrescription };
