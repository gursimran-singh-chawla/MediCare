const connectDB = require('./config/db');
const { isMockMode } = require('./config/db');
const app = require('./app');
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5174';

const PORT = process.env.PORT || 4000;

async function start() {
  const connected = await connectDB();

  if (isMockMode()) {
    if (!connected) {
      console.error('Mock mode could not start the in-memory database. See the error above.');
      process.exit(1);
    }
    const { seedDemoData, DEMO_CREDENTIALS } = require('./scripts/seedDemoDoctor');
    const counts = await seedDemoData({ quiet: true });
    console.log([
      '',
      '==================== MOCK MODE ====================',
      ` Mock data: ${counts.doctors} doctors, ${counts.appointments} appointments, ${counts.reviews} reviews`,
      ' Payments are simulated (no Razorpay keys needed).',
      ' Data lives in memory and resets on every restart.',
      '',
      ` Admin   : ${DEMO_CREDENTIALS.admin.email} / ${DEMO_CREDENTIALS.admin.password}`,
      ` Doctor  : ${DEMO_CREDENTIALS.doctor.email} / ${DEMO_CREDENTIALS.doctor.password}`,
      ` Patient : ${DEMO_CREDENTIALS.patient.email} / ${DEMO_CREDENTIALS.patient.password}`,
      '',
      ` Open ${CLIENT_URL.split(',')[0]}`,
      '===================================================',
      ''
    ].join('\n'));
  }

  app.listen(PORT, () => {
    console.log(`MediCare API running on http://localhost:${PORT}`);
  });
}

start();
