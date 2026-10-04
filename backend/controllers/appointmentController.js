const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { getRazorpayClient, isMockPayments } = require('../services/razorpayService');
const asyncHandler = require('../utils/asyncHandler');
const { stripSensitive } = require('../utils/serialize');
const { ratingSummaries } = require('../utils/ratings');

const CONSULTATION_MINUTES = 5;
const PRIVATE_FIELDS = '-password -aadhar -phone -medicalLicense -document -certificates -rejectionReason';
const NO_RATING = { average: 0, count: 0 };

const listApprovedDoctors = asyncHandler(async (_req, res) => {
  const doctors = await Doctor.find({ status: 'approved' }).select(PRIVATE_FIELDS).sort({ createdAt: -1 }).lean();
  const ratings = await ratingSummaries(doctors.map((doctor) => doctor._id));
  res.json({
    success: true,
    doctors: doctors.map((doctor) => ({ ...doctor, rating: ratings.get(String(doctor._id)) || NO_RATING }))
  });
});

const getApprovedDoctor = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Doctor is not available for appointments.' });
  const doctor = await Doctor.findOne({ _id: req.params.id, status: 'approved' }).select(PRIVATE_FIELDS).lean();
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor is not available for appointments.' });
  const ratings = await ratingSummaries([doctor._id]);
  res.json({ success: true, doctor: { ...doctor, rating: ratings.get(String(doctor._id)) || NO_RATING } });
});

const createAppointment = asyncHandler(async (req, res) => {
  const {
    doctorId,
    patientName,
    patientEmail,
    appointmentDate,
    appointmentTime,
    appointmentNumber
  } = req.body;

  const doctor = await Doctor.findOne({ _id: doctorId, status: 'approved' });
  if (!doctor) return res.status(404).json({ success: false, message: 'This doctor is not approved for appointments.' });

  const amount = Number(doctor.price) * CONSULTATION_MINUTES;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid consultation fee for selected doctor.' });
  }

  const mock = isMockPayments();
  const order = mock
    ? { id: `order_mock_${Date.now()}`, amount: Math.round(amount * 100), currency: 'INR' }
    : await getRazorpayClient().orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `appt_${Date.now()}`
    });

  const appointment = await Appointment.create({
    patientName,
    patientEmail,
    patientPhone: appointmentNumber,
    doctor: doctor._id,
    doctorName: doctor.name,
    doctorEmail: doctor.email,
    doctorSpecialization: doctor.specialization,
    date: appointmentDate,
    time: appointmentTime,
    paymentStatus: 'pending',
    appointmentStatus: 'pending_payment',
    orderId: order.id,
    amount
  });

  res.status(201).json({
    success: true,
    appointment,
    doctor: stripSensitive(doctor),
    order,
    razorpayKeyId: mock ? null : process.env.RAZORPAY_KEY_ID,
    mock,
    amount
  });
});

const listPatientBookings = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patientEmail: req.session.user.email }).sort({ createdAt: -1 });
  res.json({ success: true, appointments, user: stripSensitive(req.session.user) });
});

const getPatientBooking = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    patientEmail: req.session.user.email
  });
  if (!appointment) return res.status(404).json({ success: false, message: 'Booking not found for your patient account.' });
  res.json({ success: true, appointment });
});

module.exports = {
  listApprovedDoctors,
  getApprovedDoctor,
  createAppointment,
  listPatientBookings,
  getPatientBooking
};
