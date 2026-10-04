// Entry point for mock mode: in-memory database, auto-loaded mock data,
// simulated payments and fixed demo credentials. Values set here win over .env.
process.env.MOCK_MODE = 'true';
process.env.MOCK_PAYMENTS = 'true';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = 'admin';
process.env.EMAIL_USER = '';
process.env.EMAIL_PASS = '';

require('./server');
