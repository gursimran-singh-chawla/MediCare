const app = require('../backend/app');
const connectDB = require('../backend/config/db');

let databaseConnection;

module.exports = async (req, res) => {
  try {
    if (!databaseConnection) databaseConnection = connectDB();
    const connected = await databaseConnection;
    if (!connected) {
      databaseConnection = null;
      return res.status(503).json({ success: false, message: 'Database connection is unavailable.' });
    }
    return app(req, res);
  } catch (error) {
    databaseConnection = null;
    console.error('Vercel function startup error:', error);
    return res.status(500).json({ success: false, message: 'Server startup failed.' });
  }
};
