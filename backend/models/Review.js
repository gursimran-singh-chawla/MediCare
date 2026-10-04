const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 }
}, { timestamps: true });

reviewSchema.index({ doctor: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
