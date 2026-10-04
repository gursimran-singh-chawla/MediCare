const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const { ratingDetails } = require('../utils/ratings');

async function findApprovedDoctor(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Doctor.findOne({ _id: id, status: 'approved' });
}

function hasPaidVisit(doctor, user) {
  return Appointment.exists({
    patientEmail: user.email,
    paymentStatus: 'paid',
    $or: [{ doctor: doctor._id }, { doctorEmail: doctor.email }]
  });
}

const listReviews = asyncHandler(async (req, res) => {
  const doctor = await findApprovedDoctor(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

  const [reviews, summary] = await Promise.all([
    Review.find({ doctor: doctor._id }).sort({ updatedAt: -1 }).select('-user').lean(),
    ratingDetails(doctor._id)
  ]);

  const user = req.session.user;
  let myReview = null;
  let canReview = false;
  if (user) {
    myReview = await Review.findOne({ doctor: doctor._id, user: user._id }).select('-user').lean();
    canReview = Boolean(await hasPaidVisit(doctor, user));
  }

  res.json({ success: true, summary, reviews, myReview, canReview });
});

const saveReview = asyncHandler(async (req, res) => {
  const doctor = await findApprovedDoctor(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

  const rating = Number(req.body.rating);
  const comment = String(req.body.comment || '').trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Please choose a rating between 1 and 5 stars.' });
  }
  if (comment.length < 3 || comment.length > 1000) {
    return res.status(400).json({ success: false, message: 'Please write a review between 3 and 1000 characters.' });
  }

  const user = req.session.user;
  if (!(await hasPaidVisit(doctor, user))) {
    return res.status(403).json({ success: false, message: 'You can review a doctor after a paid appointment with them.' });
  }

  const review = await Review.findOneAndUpdate(
    { doctor: doctor._id, user: user._id },
    { rating, comment, patientName: user.name || 'Patient' },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  ).select('-user');

  res.json({ success: true, message: 'Thanks for your review!', review });
});

const deleteReview = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Doctor not found.' });
  await Review.deleteOne({ doctor: req.params.id, user: req.session.user._id });
  res.json({ success: true, message: 'Your review was removed.' });
});

module.exports = { listReviews, saveReview, deleteReview };
