const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Doctor = require('../models/Doctor');
const asyncHandler = require('../utils/asyncHandler');
const { stripSensitive, sessionPayload } = require('../utils/serialize');

function clearRoles(req) {
  req.session.user = null;
  req.session.doctor = null;
  req.session.isAdmin = false;
}

function isAdminLogin(identifier, password) {
  const accepted = [process.env.ADMIN_USERNAME, process.env.ADMIN_EMAIL]
    .map((value) => (value || '').trim().toLowerCase())
    .filter(Boolean);
  return Boolean(process.env.ADMIN_PASSWORD)
    && accepted.includes(identifier.toLowerCase())
    && password === process.env.ADMIN_PASSWORD;
}

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, age, gender } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ success: false, message: 'Email is already registered.' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, age, gender });
  res.status(201).json({ success: true, message: 'Account created successfully. Please login.', user: stripSensitive(user) });
});

async function loginDoctor(req, res, email, password) {
  const doctor = await Doctor.findOne({ email });
  if (!doctor) return res.status(404).json({ success: false, message: 'No doctor account found with this email.' });

  const isMatch = await bcrypt.compare(password, doctor.password || '');
  if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect email or password.' });

  if (doctor.status === 'rejected') {
    const reason = doctor.rejectionReason ? ` Reason: ${doctor.rejectionReason}` : '';
    return res.status(403).json({ success: false, message: `Your account verification was rejected.${reason}` });
  }

  if (doctor.status !== 'approved') {
    return res.status(403).json({ success: false, message: 'Your account is awaiting admin approval.' });
  }

  clearRoles(req);
  req.session.doctor = doctor;
  return res.json({ success: true, role: 'doctor', message: `Welcome back, Dr. ${doctor.name}.`, ...sessionPayload(req) });
}

async function loginPatient(req, res, email, password) {
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'No account found with this email.' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect email or password.' });

  clearRoles(req);
  req.session.user = user;
  return res.json({ success: true, role: 'patient', message: `Welcome back, ${user.name}.`, ...sessionPayload(req) });
}

const login = asyncHandler(async (req, res) => {
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';
  const role = req.body.role === 'doctor' ? 'doctor' : 'patient';

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  if (isAdminLogin(email, password)) {
    clearRoles(req);
    req.session.isAdmin = true;
    return res.json({ success: true, role: 'admin', message: 'Welcome back, admin.', ...sessionPayload(req) });
  }

  if (role === 'doctor') return loginDoctor(req, res, email, password);
  return loginPatient(req, res, email, password);
});

function logout(req, res) {
  clearRoles(req);
  res.json({ success: true, message: 'Logged out successfully.', ...sessionPayload(req) });
}

module.exports = { signup, login, logout };
