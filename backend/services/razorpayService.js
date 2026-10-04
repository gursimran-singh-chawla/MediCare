let Razorpay;

try {
  Razorpay = require('razorpay');
} catch (error) {
  Razorpay = null;
}

function getRazorpayClient() {
  if (!Razorpay) {
    throw new Error('Razorpay package is not installed. Run npm install razorpay.');
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are missing in .env.');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

function isMockPayments() {
  return process.env.MOCK_PAYMENTS === 'true';
}

module.exports = {
  getRazorpayClient,
  isMockPayments
};
