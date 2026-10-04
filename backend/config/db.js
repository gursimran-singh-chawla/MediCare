const mongoose = require('mongoose');

const isMockMode = () => process.env.MOCK_MODE === 'true';

async function startMemoryServer() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  console.log('Mock mode: starting in-memory MongoDB (first run downloads it, please wait)...');
  const server = await MongoMemoryServer.create({ instance: { launchTimeout: 120000 } });
  const stop = () => server.stop().finally(() => process.exit(0));
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  return server.getUri('medicare');
}

async function connectDB() {
  if (mongoose.connection.readyState === 1) return true;

  try {
    const uri = isMockMode()
      ? await startMemoryServer()
      : process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare';
    await mongoose.connect(uri);
    console.log(isMockMode() ? 'MongoDB connected (in-memory mock database)' : 'MongoDB connected');
    return true;
  } catch (error) {
    console.error('Mongo error:', error);
    return false;
  }
}

module.exports = connectDB;
module.exports.isMockMode = isMockMode;
