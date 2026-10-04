const express = require('express');
const { verifyPayment, markFailed, getSuccess, getReceipt } = require('../controllers/paymentController');

const router = express.Router();

router.post('/verify', verifyPayment);
router.post('/failed', markFailed);
router.get('/success/:id', getSuccess);
router.get('/receipt/:id', getReceipt);

module.exports = router;
