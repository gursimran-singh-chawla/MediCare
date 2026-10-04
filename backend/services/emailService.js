const nodemailer = require('nodemailer');

const fromEmail = process.env.EMAIL_USER;
const emailEnabled = Boolean(fromEmail && process.env.EMAIL_PASS);

const transporter = emailEnabled
  ? nodemailer.createTransport({
    service: 'gmail',
    auth: { user: fromEmail, pass: process.env.EMAIL_PASS }
  })
  : null;

async function sendMail({ to, subject, text, html }) {
  if (!to) return false;
  if (!emailEnabled) {
    console.log(`Email skipped for ${to} (EMAIL_USER / EMAIL_PASS not set): ${subject}`);
    return false;
  }
  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      text,
      html
    });
    console.log(`Email sent to ${to}: ${info.messageId || info.response}`);
    return true;
  } catch (error) {
    console.error(`Email failed for ${to}:`, error.message, error.response || '');
    return false;
  }
}

function sendDoctorRegistrationPending(doctor) {
  return sendMail({
    to: doctor.email,
    subject: 'MediCare Verification Pending',
    text: 'Your doctor account has been submitted for verification.\nOur admin team will review your documents shortly.'
  });
}

function sendDoctorApproval(doctor) {
  return sendMail({
    to: doctor.email,
    subject: 'MediCare Account Approved',
    text: 'Congratulations! Your account has been approved.\nYou can now login and start accepting appointments.'
  });
}

function sendDoctorRejection(doctor, reason) {
  return sendMail({
    to: doctor.email,
    subject: 'MediCare Verification Rejected',
    text: `Your doctor verification was rejected.\n\nReason: ${reason || 'Not specified'}`
  });
}

function sendPatientAppointmentConfirmation(appointment) {
  return sendMail({
    to: appointment.patientEmail,
    subject: 'Appointment Confirmed',
    text: [
      `Dear ${appointment.patientName},`,
      '',
      `Your appointment with Dr. ${appointment.doctorName} is confirmed.`,
      `Appointment Date: ${appointment.date}`,
      `Appointment Time: ${appointment.time}`,
      `Payment ID: ${appointment.paymentId}`,
      `Receipt Number: ${appointment.receiptNumber || 'N/A'}`,
      `Meeting Link: ${appointment.meetingLink || 'N/A'}`,
      '',
      'Please join the meeting at the scheduled time.'
    ].join('\n')
  });
}

function sendDoctorPaidAppointmentNotification(appointment) {
  return sendMail({
    to: appointment.doctorEmail,
    subject: 'New Paid Appointment',
    text: [
      `Dear Dr. ${appointment.doctorName},`,
      '',
      'You have received a new paid appointment.',
      `Patient: ${appointment.patientName}`,
      `Patient Email: ${appointment.patientEmail}`,
      `Appointment Date: ${appointment.date}`,
      `Appointment Time: ${appointment.time}`,
      `Payment ID: ${appointment.paymentId}`,
      `Receipt Number: ${appointment.receiptNumber || 'N/A'}`,
      `Meeting Link: ${appointment.meetingLink || 'N/A'}`,
      '',
      'Please join the meeting at the scheduled time.'
    ].join('\n')
  });
}

module.exports = {
  sendMail,
  sendDoctorRegistrationPending,
  sendDoctorApproval,
  sendDoctorRejection,
  sendPatientAppointmentConfirmation,
  sendDoctorPaidAppointmentNotification
};
