const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, trim: true },
  aadhar: { type: String, required: true, trim: true },
  specialization: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  medicalLicense: { type: String, required: true, trim: true },
  experience: { type: Number, required: true },
  price: { type: Number, required: true },
  address: { type: String, required: true, trim: true },
  availableDays: [{ type: String, trim: true }],
  image: { type: String, required: true },
  document: { type: String, required: true },
  certificates: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedAt: Date,
  rejectionReason: String
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
