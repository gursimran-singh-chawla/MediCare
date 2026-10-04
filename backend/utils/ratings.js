const Review = require('../models/Review');

const round = (value) => Math.round(value * 10) / 10;

async function ratingSummaries(doctorIds) {
  const rows = await Review.aggregate([
    { $match: { doctor: { $in: doctorIds } } },
    { $group: { _id: '$doctor', average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  return new Map(rows.map((row) => [String(row._id), { average: round(row.average), count: row.count }]));
}

async function ratingDetails(doctorId) {
  const rows = await Review.aggregate([
    { $match: { doctor: doctorId } },
    { $group: { _id: '$rating', count: { $sum: 1 } } }
  ]);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  rows.forEach((row) => { distribution[row._id] = row.count; });
  const count = rows.reduce((sum, row) => sum + row.count, 0);
  const total = rows.reduce((sum, row) => sum + row._id * row.count, 0);
  return { average: count ? round(total / count) : 0, count, distribution };
}

module.exports = { ratingSummaries, ratingDetails };
