const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  patientPhone: String,
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  doctorName: { type: String, required: true },
  doctorEmail: { type: String, required: true },
  doctorSpecialization: String,
  date: { type: String, required: true },
  time: { type: String, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  appointmentStatus: {
    type: String,
    enum: ['pending_payment', 'confirmed', 'cancelled'],
    default: 'pending_payment'
  },
  paymentId: String,
  orderId: String,
  amount: Number,
  paidAt: Date,
  receiptNumber: String,
  meetingLink: String,
  prescription: {
    diagnosis: String,
    notes: String,
    medicines: [{
      name: String,
      dosage: String,
      frequency: {
        type: String,
        enum: ['OD', 'BD', 'TDS', 'QID', 'SOS', 'HS', 'Other'],
        default: 'OD'
      },
      duration: String,
      instructions: String
    }],
    updatedAt: Date
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
