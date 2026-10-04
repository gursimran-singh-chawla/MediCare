const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const {
  dashboard,
  getDoctor,
  listDoctorsByStatus,
  listDoctorAppointments,
  approveDoctor,
  rejectDoctor,
  deleteDoctor
} = require('../controllers/adminController');

const router = express.Router();

router.use(requireAdmin);

router.get('/dashboard', dashboard);
router.get('/doctor/:id', getDoctor);
router.get('/doctors/:id/appointments', listDoctorAppointments);
router.get('/doctors/:status', listDoctorsByStatus);
router.post('/doctors/:id/approve', approveDoctor);
router.post('/doctors/:id/reject', rejectDoctor);
router.delete('/doctors/:id', deleteDoctor);

module.exports = router;
