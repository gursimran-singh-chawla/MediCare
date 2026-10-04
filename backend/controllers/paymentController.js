const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const {
  sendPatientAppointmentConfirmation,
  sendDoctorPaidAppointmentNotification
} = require('../services/emailService');
const { buildMeetingLink, buildReceiptNumber } = require('../utils/meeting');
const asyncHandler = require('../utils/asyncHandler');
const { isMockPayments } = require('../services/razorpayService');

const verifyPayment = asyncHandler(async (req, res) => {
  const {
    appointmentId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment || appointment.orderId !== razorpay_order_id) {
    return res.status(400).json({ success: false, message: 'Invalid appointment or order.' });
  }

  const mockPaid = isMockPayments() && req.body.mock === true && String(razorpay_order_id || '').startsWith('order_mock_');
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (!mockPaid && generatedSignature !== razorpay_signature) {
    appointment.paymentStatus = 'failed';
    await appointment.save();
    return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
  }

  appointment.paymentStatus = 'paid';
  appointment.appointmentStatus = 'confirmed';
  appointment.paymentId = mockPaid ? `pay_mock_${Date.now()}` : razorpay_payment_id;
  appointment.paidAt = new Date();
  appointment.receiptNumber = appointment.receiptNumber || buildReceiptNumber(appointment);
  appointment.meetingLink = appointment.meetingLink || buildMeetingLink(appointment);
  await appointment.save();

  await Promise.all([
    sendPatientAppointmentConfirmation(appointment),
    sendDoctorPaidAppointmentNotification(appointment)
  ]);

  req.session.lastPaidAppointmentId = appointment._id.toString();
  res.json({
    success: true,
    message: 'Payment verified and appointment confirmed.',
    appointment,
    redirectUrl: `/payment-success/${appointment._id}`
  });
});

const markFailed = asyncHandler(async (req, res) => {
  if (req.body.appointmentId) {
    await Appointment.findByIdAndUpdate(req.body.appointmentId, { paymentStatus: 'failed' });
  }
  res.json({ success: true });
});

const getSuccess = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment || appointment.paymentStatus !== 'paid') {
    return res.status(404).json({ success: false, message: 'Payment confirmation not found.' });
  }
  res.json({ success: true, appointment });
});

const getReceipt = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment || appointment.paymentStatus !== 'paid') {
    return res.status(404).json({ success: false, message: 'Receipt not found.' });
  }

  const sessionUserEmail = req.session.user && req.session.user.email;
  const canAccess = req.session.lastPaidAppointmentId === appointment._id.toString()
    || sessionUserEmail === appointment.patientEmail
    || req.session.isAdmin;

  if (!canAccess) {
    return res.status(401).json({ success: false, message: 'Please login with the patient account used for this booking.' });
  }

  res.json({ success: true, appointment });
});

module.exports = { verifyPayment, markFailed, getSuccess, getReceipt };
