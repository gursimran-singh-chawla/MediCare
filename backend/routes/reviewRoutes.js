const express = require('express');
const { requirePatient } = require('../middleware/auth');
const { listReviews, saveReview, deleteReview } = require('../controllers/reviewController');

const router = express.Router();

router.get('/doctors/:id/reviews', listReviews);
router.post('/doctors/:id/reviews', requirePatient, saveReview);
router.delete('/doctors/:id/reviews', requirePatient, deleteReview);

module.exports = router;
