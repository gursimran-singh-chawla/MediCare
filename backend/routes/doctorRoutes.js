const express = require('express');
const upload = require('../middleware/upload');
const { requireDoctor } = require('../middleware/auth');
const {
  register,
  dashboard,
  getPrescription,
  savePrescription
} = require('../controllers/doctorController');

const router = express.Router();

router.post('/register', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'document', maxCount: 1 },
  { name: 'certificates', maxCount: 5 }
]), register);
router.get('/dashboard', requireDoctor, dashboard);
router.get('/appointments/:id/prescription', requireDoctor, getPrescription);
router.post('/appointments/:id/prescription', requireDoctor, savePrescription);

module.exports = router;
