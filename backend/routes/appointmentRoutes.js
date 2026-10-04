const express = require('express');
const { requirePatient } = require('../middleware/auth');
const {
  listApprovedDoctors,
  getApprovedDoctor,
  createAppointment,
  listPatientBookings,
  getPatientBooking
} = require('../controllers/appointmentController');

const router = express.Router();

router.get('/doctors', listApprovedDoctors);
router.get('/doctors/:id', getApprovedDoctor);
router.post('/appointments', createAppointment);
router.get('/patient/bookings', requirePatient, listPatientBookings);
router.get('/patient/bookings/:id', requirePatient, getPatientBooking);

module.exports = router;
