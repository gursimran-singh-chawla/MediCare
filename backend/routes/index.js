const express = require('express');

const router = express.Router();

router.use('/', require('./generalRoutes'));
router.use('/', require('./appointmentRoutes'));
router.use('/', require('./reviewRoutes'));
router.use('/auth', require('./authRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/doctor', require('./doctorRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;
