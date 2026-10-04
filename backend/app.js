require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const { uploadDir } = require('./middleware/upload');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { isMockMode } = require('./config/db');

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5174';
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.use(cors({ origin: CLIENT_URL.split(','), credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'medicare-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction
  }
};

if (process.env.MONGODB_URI && !isMockMode()) {
  sessionOptions.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  });
}

app.use(session(sessionOptions));

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'MediCare API is running', client: CLIENT_URL });
});

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
